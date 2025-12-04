let q = null;
let buffer = null;
let colorLayer = null;
let time = 0;
const agents = [];
const AGENT_COUNT = 2;
const FADE_AMOUNT = 0.995;
const MODES = ['orbit', 'lissajous', 'spiral', 'ping', 'rose'];
let modePreference = 'random';

function setContext(qInstance) {
	q = qInstance;
	createBuffer();
}

function createBuffer() {
	if (!q) return;
	const needsResize = !buffer || buffer.width !== q.width || buffer.height !== q.height;
	if (!needsResize && colorLayer) return;

	buffer = q.createGraphics(q.width, q.height);
	buffer.clear();
	colorLayer = q.createGraphics(q.width, q.height);
	colorLayer.clear();
	initAgents();
}

function initAgents() {
	agents.length = 0;
	for (let i = 0; i < AGENT_COUNT; i++) {
		agents.push({
			seed: Math.random() * 1000,
			mode: pickMode(),
			radius: 0.6 + Math.random() * 0.8,
			size: 4 + Math.random() * 10,
			offset: Math.random() * Math.PI * 2,
			spin: Math.random() > 0.5 ? 1 : -1,
			radialFreq: 0.3 + Math.random() * 1.2,
			freqX: 0.6 + Math.random() * 1.8,
			freqY: 0.6 + Math.random() * 1.8,
			pulseFreq: 0.8 + Math.random() * 1.2
		});
	}
}

function fadeBuffer() {
	if (!buffer) return;
	const ctx = buffer.drawingContext;
	ctx.save();
	ctx.globalCompositeOperation = 'destination-in'; // multiply existing alpha by FADE_AMOUNT
	ctx.fillStyle = `rgba(255,255,255,${FADE_AMOUNT})`;
	ctx.fillRect(0, 0, buffer.width, buffer.height);
	ctx.restore();
}

function noise2(x, y) {
	if (q && typeof q.noise === 'function') return q.noise(x, y);
	return 0.5 + 0.5 * Math.sin(x * 1.3 + y * 0.7);
}

function update(dt = 0, speed = 1) {
	if (!q) return;
	createBuffer();
	if (!buffer) return;
	speed = speed/100
	fadeBuffer();

	const motion = Math.max(0, speed);
	time += dt * motion;

	const ctx = buffer.drawingContext;
	const minDim = Math.min(buffer.width, buffer.height);
	const baseRadius = minDim * 0.4;
	const drift = minDim * 0.08;
	const swirl = time * 0.6;

	ctx.save();
	ctx.translate(buffer.width / 2, buffer.height / 2);
	ctx.globalCompositeOperation = 'lighter';

	for (const agent of agents) {
		const positions = getAgentPositions(agent, time, baseRadius, drift, swirl);
		for (const pos of positions) {
			const size = agent.size * (0.55 + 0.45 * pos.pulse) + 5;
			const opacity = 0.2 + 0.5 * pos.pulse;

			ctx.beginPath();
			ctx.fillStyle = `rgba(255,255,255,${opacity})`;
			ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	ctx.restore();
}

function draw(x = 0, y = 0, color = [255, 255, 255, 255], ammount = 6) {
	if (!q || !buffer) return;

	const copies = Math.max(1, Math.floor(ammount ?? 1));
	const [r = 255, g = 255, b = 255, a = 255] = color;
	const layer = colorLayer || buffer;

	// recolor the buffer into colorLayer so each frame updates even when tint stays the same
	if (colorLayer) {
		colorLayer.clear();
		colorLayer.image(buffer, 0, 0);
		const ctx = colorLayer.drawingContext;
		ctx.save();
		ctx.globalCompositeOperation = 'source-atop';
		ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
		ctx.fillRect(0, 0, colorLayer.width, colorLayer.height);
		ctx.restore();
	}

	q.push();
	q.translate(x, y);
	q.blendMode?.(q.ADD);
	for (let i = 0; i < copies; i++) {
		q.push();
		q.rotate(q.radians((360 / copies) * i));
		q.image(layer, -layer.width / 2, -layer.height / 2);
		q.pop();
	}
	q.blendMode?.(q.BLEND);
	q.pop();
}

function radialPulse(t, freq, seed) {
	// Returns a factor that breathes toward/away from center; range roughly 0.05..1.4
	return 0.05 + 1.35 * (0.5 + 0.5 * Math.sin(t * freq + seed));
}

function getAgentPositions(agent, t, baseRadius, drift, swirl) {
	const jitterX = (noise2(agent.seed, t * 0.25) - 0.5) * drift;
	const jitterY = (noise2(agent.seed + 10, t * 0.3) - 0.5) * drift;
	const pulse = 0.5 + 0.5 * Math.sin(t * agent.pulseFreq + agent.seed);
	const radial = baseRadius * agent.radius * radialPulse(t, agent.radialFreq, agent.seed);
	const results = [];

	switch (agent.mode) {
		case 'lissajous': {
			const x = Math.sin(t * agent.freqX + agent.offset) * radial + jitterX;
			const y = Math.sin(t * agent.freqY + agent.offset * 1.3) * radial + jitterY;
			results.push({ x, y, pulse });
			break;
		}
		case 'spiral': {
			const angle = swirl * agent.spin + t * (0.4 + agent.spin * 0.2) + agent.offset;
			const radius = radial * (0.6 + 0.4 * Math.sin(t * 0.7 + agent.seed * 1.1));
			const x = Math.cos(angle) * radius + jitterX;
			const y = Math.sin(angle) * radius + jitterY;
			results.push({ x, y, pulse });
			break;
		}
		case 'ping': {
			const angle = agent.offset + Math.sin(t * 0.9 + agent.seed) * 1.2 + swirl * 0.3 * agent.spin;
			const radius = radial * (Math.sin(t * agent.radialFreq + agent.seed * 2) * 0.6 + 0.7);
			const x = Math.cos(angle) * radius + jitterX;
			const y = Math.sin(angle) * radius + jitterY;
			results.push({ x, y, pulse });
			break;
		}
		case 'rose': {
			// Inspired by r = 2 + 7 * cos(2t); mirrored pair
			const phase = t * (0.8 + agent.freqX * 0.4) + agent.offset;
			const r = 2 + 7 * Math.cos(2 * phase);
			const scale = baseRadius * 0.12;
			const x = Math.cos(phase) * r * scale + jitterX;
			const y = Math.sin(phase) * r * scale + jitterY;
			const mx = -y;
			const my = -x;
			results.push({ x, y, pulse }, { x: mx, y: my, pulse });
			break;
		}
		default: {
			const angle = swirl * agent.spin + agent.offset + Math.sin(t * 0.8 + agent.seed) * 0.6;
			const radius = radial;
			const x = Math.cos(angle) * radius + jitterX;
			const y = Math.sin(angle) * radius + jitterY;
			results.push({ x, y, pulse });
			break;
		}
	}

	return results;
}

function pickMode() {
	if (modePreference === 'random') return MODES[Math.floor(Math.random() * MODES.length)];
	if (MODES.includes(modePreference)) return modePreference;
	return MODES[0];
}

function setMode(mode = 'random') {
	modePreference = MODES.includes(mode) || mode === 'random' ? mode : 'random';
	agents.forEach((a) => { a.mode = pickMode(); });
}

function setModeRandom() {
	setMode('random');
}

function reset() {
	time = 0;
	createBuffer();
	buffer?.clear();
	colorLayer?.clear();
	initAgents();
}

const spline = {
	setContext,
	update,
	draw,
	setMode,
	setModeRandom,
	reset
};

export default spline;
