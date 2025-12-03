import config from './config.js';
import osc from 'osc';
import { WebSocketServer } from 'ws';

const OSC_PORT = config.oscPort;
const WS_PORT = config.wsPort;

// Every MIDI track is defined here for quick customization.
const TRACK_CONFIG = [
	{ id: 'main', label: 'Main', notePrefix: '/note', velocityPrefix: '/velocity' },
	{ id: 'user', label: 'User', notePrefix: '/usernote', velocityPrefix: '/uservelocity' },
	{ id: 'utility', label: 'Utility', notePrefix: '/utilnote', velocityPrefix: '/utilvelocity' }
];

// Control voltage inputs can be added here without touching the rest of the code.
const CV_CONFIG = [
	{ id: 'drumEnv', address: '/drumenv', defaultValue: 0 }
];

const tracks = new Map();
const cvValues = new Map();

TRACK_CONFIG.forEach((trackDef) => {
	tracks.set(trackDef.id, {
		id: trackDef.id,
		label: trackDef.label,
		notePrefix: trackDef.notePrefix.toLowerCase(),
		velocityPrefix: trackDef.velocityPrefix.toLowerCase(),
		voices: new Map(), // voiceId -> { note, velocity, activeNote }
		activeNotes: new Map() // noteNumber -> voiceCount
	});
});

CV_CONFIG.forEach((cvDef) => {
	cvValues.set(cvDef.id, cvDef.defaultValue ?? 0);
});

const udpPort = new osc.UDPPort({
	broadcast: false,
	localAddress: '0.0.0.0',
	localPort: OSC_PORT,
	metadata: true
});

const wss = new WebSocketServer({ port: WS_PORT });

function normalizeAddress(address = '') {
	return String(address).trim().toLowerCase();
}

function firstNumericValue(args = []) {
	for (const arg of args || []) {
		if (typeof arg === 'number') return arg;
		if (typeof arg?.value === 'number') return arg.value;
	}
	return null;
}

function getTrack(trackId) {
	return tracks.get(trackId);
}

function getVoice(track, voiceId) {
	if (!track.voices.has(voiceId)) {
		track.voices.set(voiceId, { note: null, velocity: 0, activeNote: null });
	}
	return track.voices.get(voiceId);
}

function incrementActiveNote(track, note) {
	const count = track.activeNotes.get(note) || 0;
	track.activeNotes.set(note, count + 1);
}

function decrementActiveNote(track, note) {
	const count = track.activeNotes.get(note);
	if (!count) return;
	if (count <= 1) {
		track.activeNotes.delete(note);
	} else {
		track.activeNotes.set(note, count - 1);
	}
}

function matchVoice(address, prefix) {
	if (!prefix || !address.startsWith(prefix)) return null;
	const suffix = address.slice(prefix.length);
	if (suffix.length === 0) return 1;
	const voiceId = Number.parseInt(suffix, 10);
	return Number.isNaN(voiceId) ? null : voiceId;
}

function updateVoiceActivity(track, voiceId) {
	const voice = getVoice(track, voiceId);
	const note = Number.isFinite(voice.note) ? voice.note : null;
	const velocity = Number.isFinite(voice.velocity) ? voice.velocity : 0;
	const shouldBeActive = note !== null && velocity > 0;

	if (shouldBeActive) {
		if (voice.activeNote !== note) {
			if (Number.isFinite(voice.activeNote)) {
				decrementActiveNote(track, voice.activeNote);
			}
			incrementActiveNote(track, note);
			voice.activeNote = note;
		}
	} else if (Number.isFinite(voice.activeNote)) {
		decrementActiveNote(track, voice.activeNote);
		voice.activeNote = null;
	}
}

function getActiveNotes(trackId) {
	const track = getTrack(trackId);
	if (!track) return [];
	return Array.from(track.activeNotes.keys()).sort((a, b) => a - b);
}

function isNoteActive(trackId, note) {
	const track = getTrack(trackId);
	if (!track) return false;
	return (track.activeNotes.get(note) || 0) > 0;
}

function getCombinedActiveNotes() {
	const allNotes = new Set();
	for (const track of tracks.values()) {
		for (const note of track.activeNotes.keys()) {
			allNotes.add(note);
		}
	}
	return Array.from(allNotes).sort((a, b) => a - b);
}

function getStateSnapshot() {
	const trackPayload = {};

	for (const [trackId, track] of tracks) {
		const voices = {};
		for (const [voiceId, voiceState] of track.voices) {
			voices[voiceId] = {
				note: Number.isFinite(voiceState.note) ? voiceState.note : null,
				velocity: Number.isFinite(voiceState.velocity) ? voiceState.velocity : 0,
				active: Number.isFinite(voiceState.activeNote)
			};
		}

		trackPayload[trackId] = {
			label: track.label,
			activeNotes: getActiveNotes(trackId),
			voices
		};
	}

	const cvPayload = {};
	for (const [cvId, value] of cvValues) {
		cvPayload[cvId] = value;
	}

	return {
		type: 'oscState',
		tracks: trackPayload,
		cv: cvPayload,
		timestamp: Date.now()
	};
}

function broadcastJson(payload) {
	const data = JSON.stringify(payload);
	wss.clients.forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(data);
		}
	});
}

function broadcastState() {
	broadcastJson(getStateSnapshot());
	broadcastJson({
		type: 'activeNotes',
		notes: getCombinedActiveNotes(),
		timestamp: Date.now()
	});
}

function handleTrackMessage(address, value) {
	for (const track of tracks.values()) {
		const noteVoice = matchVoice(address, track.notePrefix);
		if (noteVoice !== null) {
			const voice = getVoice(track, noteVoice);
			voice.note = value;
			updateVoiceActivity(track, noteVoice);
			return true;
		}

		const velocityVoice = matchVoice(address, track.velocityPrefix);
		if (velocityVoice !== null) {
			const voice = getVoice(track, velocityVoice);
			voice.velocity = value;
			updateVoiceActivity(track, velocityVoice);
			return true;
		}
	}
	return false;
}

function handleCvMessage(address, value) {
	for (const cvDef of CV_CONFIG) {
		if (normalizeAddress(cvDef.address) === address) {
			cvValues.set(cvDef.id, value);
			return true;
		}
	}
	return false;
}

function parseOscMessage(message) {
	console.log(message);
	if (!message || typeof message.address !== 'string') return;
	const address = normalizeAddress(message.address);
	const value = firstNumericValue(message.args);
	if (value === null) return;

	const handled = handleTrackMessage(address, value) || handleCvMessage(address, value);
	if (handled) {
		broadcastState();
	}
}

udpPort.on('ready', () => {
	console.log(`OSC listener ready on udp://0.0.0.0:${OSC_PORT}`);
});

udpPort.on('message', (oscMsg) => parseOscMessage(oscMsg));

udpPort.on('error', (error) => {
	console.error('OSC listener error:', error);
});

udpPort.open();

wss.on('connection', (socket) => {
	console.log('Visual client connected');
	socket.send(JSON.stringify(getStateSnapshot()));
	socket.send(
		JSON.stringify({
			type: 'activeNotes',
			notes: getCombinedActiveNotes()
		})
	);

	socket.on('close', () => {
		console.log('Visual client disconnected');
	});

	socket.on('error', (err) => {
		console.error('WebSocket error:', err);
	});
});

wss.on('listening', () => {
	console.log(`WebSocket server ready on ws://localhost:${WS_PORT}`);
});
