// Petal variant 0: classic teardrop with true top->bottom gradient.
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 120, rotation = 0, colorTop = [255, 180, 180], colorBottom = [255, 120, 120]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
    q.rotate(q.radians(rotation))
	q.scale(size / 120);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, 90, 0, -90);
	const topA = (colorTop[3] ?? 255) / 255;
	const bottomA = (colorBottom[3] ?? 255) / 255;
	gradient.addColorStop(0, `rgba(${colorTop[0]},${colorTop[1]},${colorTop[2]},${topA})`);
	gradient.addColorStop(1, `rgba(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]},${bottomA})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	path.moveTo(0, -60);
	path.bezierCurveTo(24, -55, 48, -28, 0, 60);
	path.bezierCurveTo(-48, -28, -24, -55, 0, -60);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

export default { setContext, draw };
