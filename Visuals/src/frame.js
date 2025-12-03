let q = null;

function setContext(qInstance) {
	q = qInstance;
}

function colorToCss(c) {
	if (Array.isArray(c)) {
		const [r = 0, g = 0, b = 0, a = 255] = c;
		return `rgba(${r},${g},${b},${a / 255})`;
	}
	if (typeof c === 'string') return c;
	return 'rgba(0,0,0,1)';
}

function draw(color = [20, 20, 30, 230]) {
	if (!q) return;
	const frameThickness = q.width * 0.02;
	const sideBar = q.width * 0.15;
	const topStart = q.width * 0.2;
	const topEnd = q.width;
	const topHeight = frameThickness;
	const sideY = q.height * 0.45;
	const r = frameThickness * 0.8;

	const points = [
		{ x: topStart - frameThickness, y: 0 }, // 0: top-left (keep sharp)
		{ x: topEnd, y: 0 }, // 1: top-right (keep sharp)
		{ x: topEnd, y: sideY }, // 2: upper sidebar corner
		{ x: topEnd, y: sideY + sideBar }, // 3: triangle tip
		{ x: topEnd - sideBar, y: sideY }, // 4: triangle base
		{ x: topEnd - sideBar, y: topHeight }, // 5: lower sidebar corner
		{ x: topStart, y: topHeight } // 6: back along top bar
	];
	const radii = [r, 0, r, r, r, r, 0]; // smooth all inner joins, including first top corner

	const ctx = q.drawingContext;
	ctx.save();
	ctx.fillStyle = colorToCss(color);
	ctx.beginPath();
	// start at first point
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
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

const frame = {
	setContext,
	draw
};

export default frame;
