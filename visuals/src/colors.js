const palettes = [
	{
		name: 'Carbon Pulse',
		background: '#0a0a0c',
		backgroundSecondary: '#12123cff',
		accent: '#ff4757',
		text: '#e3e3edff',
		frame: '#611829ff'
	},
	{
		name: 'Sunburst',
		background: '#fff8e1',
		backgroundSecondary: '#fac164ff',
		accent: '#ff8c42',
		text: '#282c34',
		frame: '#c0b291ff'
	},
	{
		name: 'Neon Forest',
		background: '#0c1814',
		backgroundSecondary: '#1b7155ff',
		accent: '#2ed573',
		text: '#bbffd8',
		frame: '#1b0a21ff'
	},
	{
		name: 'Lunar Tide',
		background: '#0b0509ff',
		backgroundSecondary: '#411827ff',
		accent: '#407bff',
		text: '#d3dbff',
		frame: '#250912ff'
	},
	{
		name: 'Vapor Bloom',
		background: '#0b0818',
		backgroundSecondary: '#2b1c45',
		accent: '#ff7fd3',
		text: '#fff1ff',
		frame: '#503950ff'
	},
	{
		name: 'Electric Mango',
		background: '#0c0f18',
		backgroundSecondary: '#1a1f2c',
		accent: '#ffb82f',
		text: '#f4f7ff',
		frame: '#422c15ff'
	},
	{
		name: 'Cosmic Lime',
		background: '#0f0a1a',
		backgroundSecondary: '#25143b',
		accent: '#cbff3a',
		text: '#f1f7ff',
		frame: '#1b172fff'
	}
];

let currentIndex = 0;

function normalizeHex(hex) {
	if (typeof hex !== 'string') return '#000000';
	let value = hex.trim();
	if (!value.startsWith('#')) value = `#${value}`;
	if (value.length === 4) {
		// expand #abc -> #aabbcc
		const [, r, g, b] = value;
		value = `#${r}${r}${g}${g}${b}${b}`;
	}
	return value.slice(0, 7);
}

function hexToRgbArray(hex) {
	const normalized = normalizeHex(hex).slice(1);
	const int = Number.parseInt(normalized, 16);
	if (Number.isNaN(int)) return [0, 0, 0];
	return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function colorObject(rgbArray, hex) {
	const [r = 0, g = 0, b = 0] = rgbArray;
	return {
		r,
		g,
		b,
		rgb: [r, g, b],
		hex,
		a(opacity = 1) {
			const a = Math.max(0, Math.min(1, opacity));
			return [r, g, b, Math.round(a * 255)];
		}
	};
}

function formatPalette(palette) {
	const bgHex = normalizeHex(palette.background);
	const bg2Hex = normalizeHex(palette.backgroundSecondary);
	const accentHex = normalizeHex(palette.accent);
	const textHex = normalizeHex(palette.text);
	const frameHex = normalizeHex(palette.frame);

	return {
		name: palette.name,
		backgroundSecondary: colorObject(hexToRgbArray(bg2Hex), bg2Hex),
		background: colorObject(hexToRgbArray(bgHex), bgHex),
		accent: colorObject(hexToRgbArray(accentHex), accentHex),
		text: colorObject(hexToRgbArray(textHex), textHex),
		frame: colorObject(hexToRgbArray(frameHex), frameHex),
		hex: {
			background: bgHex,
			accent: accentHex,
			text: textHex,
			frame: frameHex
		}
	};
}

function wrapIndex(index) {
	if (!palettes.length) return 0;
	return (index + palettes.length) % palettes.length;
}

function getCurrent() {
	if (!palettes.length) return null;
	return formatPalette(palettes[currentIndex]);
}

function setNext() {
	if (!palettes.length) return null;
	currentIndex = wrapIndex(currentIndex + 1);
	return getCurrent();
}

function setPrev() {
	if (!palettes.length) return null;
	currentIndex = wrapIndex(currentIndex - 1);
	return getCurrent();
}

function setRandom() {
	if (palettes.length <= 1) return getCurrent();
	let nextIndex = currentIndex;
	while (nextIndex === currentIndex) {
		nextIndex = Math.floor(Math.random() * palettes.length);
	}
	currentIndex = nextIndex;
	return getCurrent();
}

const colors = {
	getCurrent,
	get: getCurrent,
	setNext,
	setPrev,
	setRandom,
	getAll: () => palettes.map(formatPalette),
	getIndex: () => currentIndex
};

export default colors;
