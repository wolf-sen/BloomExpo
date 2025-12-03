import 'q5/q5.js';
import config from './config.js';
import colors from './colors.js';
import background from './background.js';
import blossom from './blossom.js';
import frame from './frame.js';



// OSC EventListener

const WS_PORT = config.wsPort;
const oscState = {
	tracks: {}, // keyed by track id (main, user, utility)
	cv: {} // drumEnvelope, etc.
};

const trackNotes = new Map(); // trackId -> Set(notes)
const combinedNotes = new Set();
const noteWasActive = new Map(); // trackId -> Set of notes currently latched

function sanitizeNotes(notes = []) {
	const sanitized = [];
	for (const note of notes) {
		if (Number.isFinite(note)) sanitized.push(Math.trunc(note));
	}
	return sanitized;
}

function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
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

function connectToListener() {
	const host = window.location.hostname || 'localhost';
	const socket = new WebSocket(`ws://${host}:${WS_PORT}`);
	
	socket.addEventListener('message', (event) => {
		try {
			const payload = JSON.parse(event.data);
			if (payload.type === 'oscState') {
				updateTrackNotes(payload.tracks ?? {});
				oscState.tracks = payload.tracks ?? {};
				oscState.cv = payload.cv ?? {};
			} else if (payload.type === 'activeNotes') {
				updateCombinedNotes(payload.notes); // optional combined view
			}
		} catch (err) {
			console.error('OSC message parse error:', err);
		}
	});
	
	socket.addEventListener('close', () => setTimeout(connectToListener, 2000));
	socket.addEventListener('error', () => socket.close());
}

connectToListener();

// Q5 Section
const q = new window.Q5('global');
let lastTimestamp = 0;
let deltaTime = 0;
let globalSpeed = 0;
let count = 0
let activity = false;
let amount = 5

q.keyPressed = function keyPressed() {
	if (q.key === 'c') colors.setRandom();
	if (q.key === 'b') {
		blossom.setNext();
		console.log("Next Flower")
	}
};


q.setup = function setup() {
	q.createCanvas(q.windowWidth, q.windowHeight);
	q.frameRate(config.frameLimit);
	background.setContext(q);
	blossom.setContext(q);
	frame.setContext(q);
};

q.windowResized = function windowResized() {
	q.resizeCanvas(q.windowWidth, q.windowHeight);
};

q.draw = function draw() {
	// calculate delta time in seconds
	const now = q.millis();
	deltaTime = lastTimestamp > 0 ? (now - lastTimestamp) / 1000 : 0;
	lastTimestamp = now;

	//update external data
	const mainActiveNotes = getTrackNotes('main');
	const userActiveNotes = getTrackNotes('user');
	const utilityActiveNotes = getTrackNotes('utility');
	const drumEnv = oscState.cv.drumEnv * 1.5 ?? 0;
	const palette = colors.get();

	// Update globalSpeed: rise with drumEnv spikes, decay when quiet.
	const envNormalized = clamp01(drumEnv * 100 / 127); // adjust if your envelope is already 0..1
	const targetSpeed = 5 + envNormalized * 500; // base speed 1, up to 9 when env is high
	const smoothing = 10; // higher = snappier response
	const alpha = 1 - Math.exp(-smoothing * deltaTime);
	globalSpeed = globalSpeed + (targetSpeed - globalSpeed) * alpha;
	
	//process Notess
	if (noteTriggered('main', 36)) {
		colors.setRandom();
		activity = true;
	}
	if (noteTriggered('main', 38)) {
		blossom.setRandom();
		activity = true;
	}
	if (noteTriggered('utility', 100)) {
		console.log("loopStart");
		console.log(activity)
		if (activity) {
			activity = false;
			return;
		}
		blossom.setRandom();
		if (count == 1) {
			colors.setRandom();
			amount = Math.floor(map(Math.random(), 0, 1, 3, 12))
			count = 0
		}
		else count++;
	}
	
	//draw image
	background.draw(palette.background, palette.backgroundSecondary, drumEnv * config.backgroundGlowIntensity);
	blossom.draw(q.width/2, q.height/2, deltaTime, globalSpeed, amount)
	
	frame.draw([50, 50, 50, 255]);
	
	//debugging
	if(config.oscDebugging) {
		if (mainActiveNotes.length > 0) console.log('Main notes', mainActiveNotes);
		if (userActiveNotes.length > 0) console.log('User notes', userActiveNotes);
		if (utilityActiveNotes.length > 0) console.log('Utility notes', utilityActiveNotes);
	}
};
