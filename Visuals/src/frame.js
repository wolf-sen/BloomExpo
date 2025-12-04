import colors from './colors.js';
import oscClient from './oscClient';

let q = null;
let fontLoaded = false;

function setContext(qInstance) {
	q = qInstance;
}

function draw() {
	if (!q) return;
	const palette = colors.get();
	const frameColor = palette.frame.rgb ?? [50, 50, 50];
	const textColor = palette.text.rgb ?? [255, 255, 255];

	const frameThickness = q.width * 0.02;
	const sideBar = 180;
	const topStart = q.width * 0.2;
	const topEnd = q.width;
	const topHeight = frameThickness;
	const sideY = q.height * 0.45;
	const r = frameThickness * 0.8;

	const points = [
		{ x: topStart - frameThickness, y: 0 },
		{ x: topEnd, y: 0 },
		{ x: topEnd, y: sideY },
		{ x: topEnd, y: sideY + sideBar },
		{ x: topEnd - sideBar, y: sideY },
		{ x: topEnd - sideBar, y: topHeight },
		{ x: topStart, y: topHeight }
	];
	const radii = [r, 0, r, r, r, r, 0];

	const ctx = q.drawingContext;
	ctx.save();
	ctx.fillStyle = `rgba(${frameColor[0]},${frameColor[1]},${frameColor[2]},${(frameColor[3] ?? 255) / 255})`;
	ctx.beginPath();
	ctx.moveTo(points[0].x, points[0].y);
	for (let i = 0; i < points.length; i++) {
		const cur = points[i];
		const next = points[(i + 1) % points.length];
		const radius = radii[i] || 0;
		if (radius > 0) {
			ctx.arcTo(cur.x, cur.y, next.x, next.y, radius);
		} else {
			ctx.lineTo(cur.x, cur.y);
		}
	}
	ctx.closePath();
	ctx.fill();
	ctx.restore();

	q.push();
	q.translate(q.width - sideBar + 24, sideY - 24);
	q.rotate(q.radians(-90));
	textDraw(textColor);
	q.pop();
}

function textDraw(fillColor = [255, 255, 255]) {
	if (!q) return;
	if (!fontLoaded) {
		q.textFont(q.loadFont('./assets/VCR_OSD.ttf'));
		fontLoaded = true;
	}
	q.push();
	q.fill(fillColor);
	q.textAlign(q.LEFT, q.TOP);
	q.textSize(57);
	q.text('Bloom', 640, 0);
	q.textSize(24);
	q.text('Experemental \nDesign CVD01', 640, 68);
	q.pop();
}

const frame = {
	setContext,
	draw,
	textDraw
};

export default frame;
