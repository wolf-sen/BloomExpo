// Petal variant 3: narrow shield with high shoulders and lean waist.
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 130, rotation = 0, colorTop = [240, 220, 210], colorBottom = [220, 140, 130]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
	q.rotate(q.radians(rotation));
	q.scale(size / 130);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, 90, 0, -90);
	const topA = (colorTop[3] ?? 255) / 255;
	const bottomA = (colorBottom[3] ?? 255) / 255;
	gradient.addColorStop(0, `rgba(${colorTop[0]},${colorTop[1]},${colorTop[2]},${topA})`);
	gradient.addColorStop(1, `rgba(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]},${bottomA})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	path.moveTo(0, -90);
	path.bezierCurveTo(26, -82, 34, -58, 12, -30);
	path.bezierCurveTo(46, -6, 52, 28, 18, 90);
	path.bezierCurveTo(8, 104, -8, 104, -18, 90);
	path.bezierCurveTo(-52, 28, -46, -6, -12, -30);
	path.bezierCurveTo(-34, -58, -26, -82, 0, -90);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

export default { setContext, draw };
