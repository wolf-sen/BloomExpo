// Petal variant 2: faceted diamond leaf with crisp waist (second ref inspired).
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 150, rotation = 0, colorTop = [240, 200, 220], colorBottom = [220, 120, 180]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
	q.rotate(q.radians(rotation));
	q.scale(size / 150);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, -92, 0, 96);
	gradient.addColorStop(0, `rgb(${colorTop[0]},${colorTop[1]},${colorTop[2]})`);
	gradient.addColorStop(1, `rgb(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	path.moveTo(0, -92);
	path.bezierCurveTo(32, -82, 42, -52, 18, -20);
	path.bezierCurveTo(46, 6, 58, 34, 18, 92);
	path.bezierCurveTo(6, 104, -6, 104, -18, 92);
	path.bezierCurveTo(-58, 34, -46, 6, -18, -20);
	path.bezierCurveTo(-42, -52, -32, -82, 0, -92);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

const pedal2 = { setContext, draw };
export default pedal2;
