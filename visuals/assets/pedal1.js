// Petal variant 1: tall taper with narrow waist and softly rounded shoulders (crisper silhouette).
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 140, rotation = 0, colorTop = [255, 215, 210], colorBottom = [255, 150, 150]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
	q.rotate(q.radians(rotation));
	q.scale(size / 140);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, 90, 0, -90);
	gradient.addColorStop(0, `rgb(${colorTop[0]},${colorTop[1]},${colorTop[2]})`);
	gradient.addColorStop(1, `rgb(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	// Tall taper with tight waist and defined shoulders
	path.moveTo(0, -90);
	path.bezierCurveTo(28, -84, 52, -56, 42, -18);
	path.bezierCurveTo(30, 12, 18, 42, 8, 82);
	path.bezierCurveTo(4, 92, -4, 92, -8, 82);
	path.bezierCurveTo(-18, 42, -30, 12, -42, -18);
	path.bezierCurveTo(-52, -56, -28, -84, 0, -90);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

export default { setContext, draw };
