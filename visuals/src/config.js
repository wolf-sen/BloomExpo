const config = {
	wsPort: 8080,
	oscPort: 2346,
	oscDebugging: false,
	frameLimit: 120,
	backgroundGlowIntensity: 2,
	pedalScale: 2.0,
};

// Named exports remain available, but prefer the default object (config.wsPort, etc.)
export const {
	wsPort,
	oscPort,
	oscDebugging,
	frameLimit,
	backgroundGlowIntensity,
	pedalScale,
	pedalRasterSize
} = config;
export default config;
