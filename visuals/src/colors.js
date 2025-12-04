const palettes = [
	{
		name: 'Carbon Pulse',
		background: '#040414ff',
		backgroundSecondary: '#2c2c84ff',
		accent: '#ff214aff',
		text: '#9f9fdcff',
		frame: '#362959ff'
	},
	{
		name: 'Sunburst',
		background: '#fff8e9ff',
		backgroundSecondary: '#f39645ff',
		accent: '#ff481fff',
		text: '#661a09ff',
		frame: '#f4d3acff'
	}, 
	{
		name: 'Neon Forest',
		background: '#0c0219ff',
		backgroundSecondary: '#0c492eff',
		accent: '#7bffb4ff',
		text: '#a1ffcaff',
		frame: '#22052dff'
	}, 
	{
		name: 'Lunar Tide',
		background: '#0b0509ff',
		backgroundSecondary: '#82163eff',
		accent: '#2831b3ff',
		text: '#d3dbff',
		frame: '#471626ff'
	}, 
	{
		name: 'Vapor Bloom',
		background: '#120a1eff',
		backgroundSecondary: '#2b1c45',
		accent: '#b3358bff',
		text: '#bf88bfff',
		frame: '#3b183bff'
	}, 
	{
		name: 'Electric Mango',
		background: '#0b0e01ff',
		backgroundSecondary: '#1a1f2c',
		accent: '#ee811bff',
		text: '#161808ff',
		frame: '#724c22ff'
	}, 
	{
		name: 'Cosmic Lime',
		background: '#0f0a1a',
		backgroundSecondary: '#2f174fff',
		accent: '#c4ff23ff',
		text: '#7e90a8ff',
		frame: '#1b172fff'
	},
	{
		
		name: 'Nebula Cyan',
		background: '#0a0f1d',
		backgroundSecondary: '#13263f',
		accent: '#3affe9',
		text: '#b9d4dcff',
		frame: '#131b2f'
	}, 
	{
		name: 'Quantum Amber',
		background: '#0e0a12',
		backgroundSecondary: '#2a1f25',
		accent: '#ffbf3a',
		text: '#fff7e7',
		frame: '#1d151e'
	},
	{
		name: 'Hypernova Blue',
		background: '#050a1aff',
		backgroundSecondary: '#0f1d3f',
		accent: '#ffec16ff',
		text: '#d8e9bfff',
		frame: '#0d162f'
	},
	{
		name: 'Acid Orchid',
		background: '#120a1d',
		backgroundSecondary: '#2e1a4b',
		accent: '#d3ff0d',
		text: '#f7ecff',
		frame: '#201433'
	},
	{
		name: 'Paradox Tealberry',
		background: '#0a1414',
		backgroundSecondary: '#182d2f',
		accent: '#ff3aad',   
		text: '#f5fcfa',
		frame: '#132525'
	},
	{
		name: 'Solar Glacier',
		background: '#f4fbff',         
		backgroundSecondary: '#d289efff', 
		accent: '#00e8ff',  
		text: '#0d1b26',
		frame: '#b2c5e3ff'
	},
	{
		name: 'Chromatic Drift',
		background: '#c9e3d9ff',
		backgroundSecondary: '#8b70cbff', 
		accent: '#9ae537ff',              
		text: '#c9e3d9ff',
		frame: '#604e72ff'
	},
	{
		name: 'Ultraviolet Milk',
		background: '#e9ecd9ff',
		backgroundSecondary: '#c3c66eff',
		accent: '#6b00ff',              
		text: '#1b0d2a',
		frame: '#d5c5aeff'
	},
	{
		name: 'Venom Caramel',
		background: '#f7ebdcff',         
		backgroundSecondary: '#ffe0a1', 
		accent: '#26a861ff',           
		text: '#213e21ff',
		frame: '#c2d291ff'
	},
	{
		name: 'AHOI Captain',
		background: '#162841ff',          
		backgroundSecondary: '#3991ccff', 
		accent: '#ff9a41ff',              
		text: '#274269ff',
		frame: '#959facff'
	},
	{
		name: 'Morgendämmerung',
		background: '#1d060dff',          
		backgroundSecondary: '#8b5151ff', 
		accent: '#ff9e53ff',              
		text: '#1d060dff',
		frame: '#dda97cff'
	},
	{
		name: 'Old and Charming',
		background: '#1a1718ff',          
		backgroundSecondary: '#522f43ff', 
		accent: '#eea2d1ff',              
		text: '#1d060dff',
		frame: '#947e8fff'
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
