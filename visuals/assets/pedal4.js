// Petal variant 4: wide crest with scooped sides and tight waist (distinct silhouette).
let qctx = null;

function setContext(qInstance) {
	qctx = qInstance;
}

function draw(x, y, size = 150, rotation = 0, colorTop = [235, 225, 215], colorBottom = [215, 160, 140]) {
	const q = qctx;
	if (!q) return;

	q.push();
	q.translate(x, y);
	q.rotate(q.radians(rotation));
	q.scale(size / 150);

	const ctx = q.drawingContext;
	ctx.save();
	const gradient = ctx.createLinearGradient(0, 90, 0, -90);
	gradient.addColorStop(0, `rgb(${colorTop[0]},${colorTop[1]},${colorTop[2]})`);
	gradient.addColorStop(1, `rgb(${colorBottom[0]},${colorBottom[1]},${colorBottom[2]})`);
	ctx.fillStyle = gradient;

	const path = new Path2D();
	path.moveTo(0, -96);
	path.bezierCurveTo(58, -82, 88, -8, 52, 14);
	path.bezierCurveTo(80, 42, 54, 104, 10, 110);
	path.bezierCurveTo(0, 112, -10, 112, -10, 110);
	path.bezierCurveTo(-54, 104, -80, 42, -52, 14);
	path.bezierCurveTo(-88, -8, -58, -82, 0, -96);
	ctx.fill(path);
	ctx.restore();

	q.pop();
}

export default { setContext, draw };
