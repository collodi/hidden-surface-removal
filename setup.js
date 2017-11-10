var pnts = [];
var input_lines = [];
var calculated = false;

var canvas = new fabric.Canvas('sheet');
canvas.selection = false;

var reset_canvas = function() {
    calculated = false;
    canvas.clear();

    pnts.length = 0;
    input_lines.length = 0;
};

var resize_canvas = function() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
};
window.addEventListener('resize', resize_canvas, false);
resize_canvas();

/* return y on line where p1 and p2 pass */
var solve_y = function(p1, p2, x) {
    if (p1.left === p2.left)
	return NaN;

    var m = (p2.top - p1.top) / (p2.left - p1.left);
    return m * (x - p1.left) + p1.top;
};

/* return y on line l */
var get_y = function(l, x) {
    return l.slope * x + l.intercept;
};

/* return x of l1, l2 intersection */
var get_inter_x = function(l1, l2) {
    if (l1.intercept === l2.intercept)
	return 0;

    if (l1.slope === l2.slope)
	return NaN;

    return (l2.intercept - l1.intercept) / (l1.slope - l2.slope);
};

/* check if l intersects with multiple lines at one point */
var dup_intersects = function(lines, l) {
    var s = new Set();

    for (var i = 0; i < lines.length; i++) {
	var x = get_inter_x(lines[i], l);
	if (!isNaN(x) && s.has(x))
	    return true;

	s.add(x);
    }
    return false;
};

var drawline = function(p1, p2) {
    canvas.remove(p1);
    canvas.remove(p2);

    if (p1.left === p2.left) {
	alert("Vertical lines are not allowed!");
	return;
    } else if (p1.left > p2.left) { /* order two points in x for convenient redrawing */
	var t = p1;
	p1 = p2;
	p2 = t;
    }

    var y0 = solve_y(p1, p2, 0);
    var xl = screen.width;
    var yl = solve_y(p1, p2, xl);

    /* draw line */
    var l = new fabric.Line(
	[0, y0, xl, yl],
	{ stroke: 'grey', strokeWidth: 2,
	  originX: 'center', originY: 'center', selectable: false }
    );
    l.slope = (y0 - yl) / xl;
    l.intercept = -y0;

    if (dup_intersects(input_lines, l)) {
	alert("Three lines intersecting at one point is not allowed!");
	return;
    }

    canvas.add(l);
    input_lines.push(l);
};

canvas.on('mouse:down', function(options) {
    if (calculated)
	return false;

    /* draw point on click */
    var c = new fabric.Circle({ radius: 2, fill: 'red', selectable: false,
				left: options.e.clientX, top: options.e.clientY,
				originX: 'center', originY: 'center' });
    canvas.add(c);
    pnts.push(c);

    if (pnts.length === 2) {
	drawline(pnts[0], pnts[1]);
	pnts.length = 0;
    }

    return false;
});

var display = document.getElementById('coord');
canvas.on('mouse:move', function(options) {
    display.innerHTML = options.e.clientX + ', ' + options.e.clientY;
});
