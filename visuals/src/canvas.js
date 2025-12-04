import 'q5/q5.js';
import config from './config.js';
import colors from './colors.js';
import background from './background.js';
import blossom from './blossom.js';
import frame from './frame.js';
import oscClient from './oscClient.js';
import spline from './spline.js';

// Timing / animation state
const q = new window.Q5('global');
let lastTimestamp = 0;
let deltaTime = 0;
let globalSpeed = 0;
let count = 0;
let activity = false;
let activetime = 0;
let amount = 5;
let splineBoost = 0;
let splineSpeed = 1;

function clamp01(value) {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(1, value));
}

oscClient.connect();

q.keyPressed = function keyPressed() {
	if (q.key === 'c') colors.setRandom();
	if (q.key === 'b') {
		blossom.setNext();
		console.log('Next Flower');
	}
};

q.setup = function setup() {
	q.createCanvas(q.windowWidth, q.windowHeight);
	q.frameRate(config.frameLimit);
	background.setContext(q);
	blossom.setContext(q);
	frame.setContext(q);
	spline.setContext(q);
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
	const mainActiveNotes = oscClient.getTrackNotes('main');
	const userActiveNotes = oscClient.getTrackNotes('user');
	const utilityActiveNotes = oscClient.getTrackNotes('utility');
	const state = oscClient.getState();
	const drumEnv = (state.cv.drumEnv ?? 0) * 1.5;
	const drumEnvNorm = map(drumEnv, 0 , 100, 0, 1)
	const palette = colors.get();

	// Update globalSpeed: rise with drumEnv spikes, decay when quiet.
	const targetSpeed = 5 + drumEnv * 3;
	const smoothing = 20; // higher = snappier response
	const alpha = 1 - Math.exp(-smoothing * deltaTime);
	globalSpeed = globalSpeed + (targetSpeed - globalSpeed) * alpha;

	//process Notes
	const colorNotes = [36, 40, 44, 48];
	if (colorNotes.some((n) => oscClient.noteTriggered('main', n))) {
		colors.setRandom();
		activity = true;
	}
	if (oscClient.noteTriggered('main', 38)) {
		blossom.setRandom();
		activity = true;
	}
	for (let n = 84; n <= 99; n++) {
		if (oscClient.noteTriggered('main', n)) {
			blossom.setRandom();
			activity = true;
			break;
		}
	}
	for (let n = 52; n <= 67; n++) {
		if (oscClient.noteTriggered('main', n)) {
			spline.reset()
			spline.setModeRandom();
			break;
		}
	}
	for (let n = 68; n <= 99; n++) {
		if (oscClient.noteTriggered('main', n)) {
			splineBoost = Math.min(splineBoost + 5, 20);
			break;
		}
	}
	if (oscClient.noteTriggered('utility', 100)) {
		if (activity) {
			if (activetime % 2){
				spline.reset();
			}
			activetime += 1;
			activity = false;
		} else {
			blossom.setRandom();
			if (count === 1) {
				colors.setRandom();
				spline.reset();
				amount = Math.floor(q.map(Math.random(), 0, 1, 3, 12));
				count = 0;
			} else {
				count++;
			}
		}
	}

	// Update spline speed separately (decays over time, boosted by note hits)
	const splineBase = 1;
	const boostDecayRate = 3; // how quickly boosts fall back
	const boostAlpha = 1 - Math.exp(-boostDecayRate * deltaTime);
	splineBoost = splineBoost + (0 - splineBoost) * boostAlpha;

	const splineTarget = splineBase + splineBoost;
	const splineSmoothing = 24; // faster response for stronger acceleration
	const splineAlpha = 1 - Math.exp(-splineSmoothing * deltaTime);
	splineSpeed = splineSpeed + (splineTarget - splineSpeed) * splineAlpha;

	//draw image
	background.draw(palette.background.rgb, palette.backgroundSecondary.rgb, drumEnvNorm * config.backgroundGlowIntensity);
	blossom.draw(q.width / 2 - 25, q.height / 2, deltaTime, globalSpeed, amount);
	spline.update(deltaTime, splineSpeed * 15);
	spline.draw(q.width / 2 - 25, q.height / 2, palette.accent.a(1), 3);
	
	//q.rect(q.width * 0.02, q.height - q.width * 0.02 - drumEnvNorm* 250, 50, drumEnvNorm*250)
	//q.rect(q.width * 0.08, q.height - q.width * 0.02 - 250, 50, 250)
	frame.draw(globalSpeed);

	//debugging
	if (config.oscDebugging) {
		if (mainActiveNotes.length > 0) console.log('Main notes', mainActiveNotes);
		if (userActiveNotes.length > 0) console.log('User notes', userActiveNotes);
		if (utilityActiveNotes.length > 0) console.log('Utility notes', utilityActiveNotes);
	}
};
