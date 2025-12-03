let ctx = null; // holds the active Q5 instance

function setContext(qInstance) {
	ctx = qInstance;
}

function clamp01(value) {
	if (Number.isNaN(value)) return 0;
	return Math.max(0, Math.min(1, value));
}

function lerpColorArray(a, b, factor) {
	return [
		a[0] + (b[0] - a[0]) * factor,
		a[1] + (b[1] - a[1]) * factor,
		a[2] + (b[2] - a[2]) * factor
	];
}

function drawGradient(q, c1, c2, intensity) {
	const mixBottom = lerpColorArray(c1, c2, clamp01(intensity));

	const ctx2d = q.drawingContext;
	const gradient = ctx2d.createLinearGradient(0, 0, 0, q.height);
	gradient.addColorStop(0, `rgb(${c1[0]}, ${c1[1]}, ${c1[2]})`);
	gradient.addColorStop(1, `rgb(${mixBottom[0]}, ${mixBottom[1]}, ${mixBottom[2]})`);

	ctx2d.save();
	ctx2d.fillStyle = gradient;
	ctx2d.fillRect(0, 0, q.width, q.height);
	ctx2d.restore();
}

function draw(color1, color2, intensity = 1, qInstance = ctx) {
	const q = qInstance;
	if (!q) return;

	drawGradient(q, color1, color2, intensity);
}

const background = {
	setContext,
	draw
};

export default background;
