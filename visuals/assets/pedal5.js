// Petal variant 5: elongated blade with asymmetric sweep and sharper point.
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 140, rotation = 0, colorTop = [245, 230, 220], colorBottom = [225, 150, 150]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
	q.rotate(q.radians(rotation));
	q.scale(size / 140);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, 90, 0, -90);
	const topA = (colorTop[3] ?? 255) / 255;
	const bottomA = (colorBottom[3] ?? 255) / 255;
	gradient.addColorStop(0, `rgba(${colorTop[0]},${colorTop[1]},${colorTop[2]},${topA})`);
	gradient.addColorStop(1, `rgba(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]},${bottomA})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	path.moveTo(0, -96);
	path.bezierCurveTo(34, -84, 56, -34, 34, 14);
	path.bezierCurveTo(54, 46, 30, 104, 6, 110);
	path.bezierCurveTo(-24, 112, -48, 60, -30, 8);
	path.bezierCurveTo(-38, -32, -10, -78, 0, -96);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

export default { setContext, draw };
