import colors from './colors.js';
import config from './config.js';
import pedal0 from '../assets/pedal0.js';
import pedal1 from '../assets/pedal1.js';
import pedal2 from '../assets/pedal2.js';
import pedal3 from '../assets/pedal3.js';
import pedal4 from '../assets/pedal4.js';
import pedal5 from '../assets/pedal5.js';

let q = null;
const pedals = [pedal0, pedal1, pedal2, pedal3, pedal4, pedal5];
let currentIndex = 0;
let rotation = 0

function setContext(qInstance) {
	q = qInstance;
	pedals.forEach((p) => p.setContext?.(qInstance));
}

function set(selection = 0) {
	currentIndex = selection % pedals.length;
}

function setRandom() {
	if (pedals.length <= 1) return;
	let next = currentIndex;
	while (next == currentIndex) {
		next = Math.floor(Math.random() * pedals.length);
	}
	currentIndex = next
	return currentIndex;
}

function setNext() {
	set(currentIndex + 1);
	return currentIndex
}

function draw(x, y, dt = 0, speed = 1, amount = 5) {
	if (!q || !pedals.length) return;
	let pedal = pedals[currentIndex];
	const palette = colors.get()
	let a = Math.floor(amount)
	rotation = (rotation + dt * speed) % 360
	let pedalRotation = 30 * Math.sin(rotation * Math.PI / 180);
	let scale = 1 * Math.sin(rotation * Math.PI / 360);
	q.push()
	q.translate(x, y);
	q.rotate(q.radians(rotation))
	q.scale(4 + scale * 0.3)
	for (let i = 1; i <= a; i++) {
		pedal.draw(
			0,
			-100 - scale * 10,
			100 + scale * 20,
			pedalRotation,
			palette.accent.a(0.5),
			palette.backgroundSecondary.a(0.3)
		);
		q.rotate(q.radians(360 / a));
	}
	q.pop()
}

const blossom = {
	setContext,
	set,
	setNext,
	setRandom,
	draw
};

export default blossom;
