const palettes = [
	{
		name: 'Carbon Pulse',
		background: '#0a0a0c',
		backgroundSecondary: '#12123cff',
		accent: '#ff4757',
		text: '#e6e6eb'
	},
	{
		name: 'Sunburst',
		background: '#fff8e1',
		backgroundSecondary: '#fac164ff',
		accent: '#ff8c42',
		text: '#282c34'
	},
	{
		name: 'Neon Forest',
		background: '#0c1814',
		backgroundSecondary: '#1b7155ff',
		accent: '#2ed573',
		text: '#bbffd8'
	},
	{
		name: 'Lunar Tide',
		background: '#0b0509ff',
		backgroundSecondary: '#411827ff',
		accent: '#407bff',
		text: '#d3dbff'
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

function formatPalette(palette) {
	return {
		name: palette.name,
		backgroundSecondary: hexToRgbArray(palette.backgroundSecondary),
		background: hexToRgbArray(palette.background),
		accent: hexToRgbArray(palette.accent),
		text: hexToRgbArray(palette.text),
		hex: {
			background: normalizeHex(palette.background),
			accent: normalizeHex(palette.accent),
			text: normalizeHex(palette.text)
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
