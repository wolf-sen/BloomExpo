import config from './config.js';

const WS_PORT = config.wsPort;

const oscState = {
	tracks: {},
	cv: {}
};

const trackNotes = new Map(); // trackId -> Set(notes)
const combinedNotes = new Set();
const noteWasActive = new Map(); // trackId -> Set of notes currently latched
const listeners = new Set();

let socket = null;
let connecting = false;

function sanitizeNotes(notes = []) {
	const sanitized = [];
	for (const note of notes) {
		if (Number.isFinite(note)) sanitized.push(Math.trunc(note));
	}
	return sanitized;
}

function updateTrackNotes(tracksPayload = {}) {
	trackNotes.clear();
	for (const [trackId, trackData] of Object.entries(tracksPayload)) {
		const notes = Array.isArray(trackData?.activeNotes)
			? sanitizeNotes(trackData.activeNotes)
			: [];
		trackNotes.set(trackId, new Set(notes));
	}
}

function updateCombinedNotes(notes = []) {
	combinedNotes.clear();
	for (const note of sanitizeNotes(notes)) {
		combinedNotes.add(note);
	}
}

function getTrackNotes(trackId) {
	return Array.from(trackNotes.get(trackId) ?? []);
}

function isTrackNoteActive(trackId, note) {
	return trackNotes.get(trackId)?.has(Math.trunc(note)) ?? false;
}

function noteTriggered(trackId, note) {
	const id = Math.trunc(note);
	const active = isTrackNoteActive(trackId, id);

	if (!noteWasActive.has(trackId)) {
		noteWasActive.set(trackId, new Set());
	}
	const latched = noteWasActive.get(trackId);

	if (active && !latched.has(id)) {
		latched.add(id);
		return true; // first frame this note turned on
	}

	if (!active && latched.has(id)) {
		latched.delete(id); // reset latch when note turns off
	}

	return false;
}

function getCombinedNotes() {
	return Array.from(combinedNotes);
}

function getState() {
	return {
		tracks: oscState.tracks,
		cv: oscState.cv
	};
}

function notify() {
	for (const cb of listeners) {
		try {
			cb(getState());
		} catch (err) {
			// ignore listener errors
		}
	}
}

function handleMessage(event) {
	try {
		const payload = JSON.parse(event.data);
		if (payload.type === 'oscState') {
			updateTrackNotes(payload.tracks ?? {});
			oscState.tracks = payload.tracks ?? {};
			oscState.cv = payload.cv ?? {};
		} else if (payload.type === 'activeNotes') {
			updateCombinedNotes(payload.notes);
		}
		notify();
	} catch (err) {
		console.error('OSC message parse error:', err);
	}
}

function connect() {
	if (socket || connecting) return;
	connecting = true;
	const host = typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost';
	const ws = new WebSocket(`ws://${host}:${WS_PORT}`);
	socket = ws;

	ws.addEventListener('message', handleMessage);
	ws.addEventListener('close', () => {
		socket = null;
		connecting = false;
		setTimeout(connect, 2000);
	});
	ws.addEventListener('error', () => {
		if (socket) socket.close();
	});
}

function addListener(cb) {
	if (typeof cb === 'function') listeners.add(cb);
}

function removeListener(cb) {
	listeners.delete(cb);
}

export default {
	connect,
	getState,
	getTrackNotes,
	getCombinedNotes,
	isTrackNoteActive,
	noteTriggered,
	addListener,
	removeListener
};
