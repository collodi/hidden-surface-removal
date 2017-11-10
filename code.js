var make_seg = function(x1, x2, l) {
    return {
	from: [x1, get_y(l, x1)],
	to: [x2, get_y(l, x2)],
	line: l,
    };
};

var seg_intersection = function(s1, s2) {
    var xint = get_inter_x(s1.line, s2.line);

    if (s1.from[0] <= xint && xint <= s1.to[0]
	&& s2.from[0] <= xint && xint <= s2.to[0])
	return [xint, get_y(s1.line, xint)];
    return [];
};

var rm_parallel = function(lines) {
    var dels = [];
    var tmp = lines[0].slope;
    for (var i = 1; i < lines.length; i++) {
    	if (tmp == lines[i].slope)
    	    dels.push(i);

	tmp = lines[i].slope;
    }

    for (var i = 0; i < dels.length; i++)
    	lines.splice(dels[i], 1);
};

var draw_poly = function(segments, color) {
    var poly = [{ x: segments[0].from[0], y: -segments[0].from[1] - 2 }];
    for (var i = 0; i < segments.length; i++)
	poly.push({ x: segments[i].to[0], y: -segments[i].to[1] - 2});

    var polyline = new fabric.Polyline(
	poly, { stroke: color, fill: '', strokeWidth: 2, selectable: false }
    );
    canvas.add(polyline);
    polyline.bringToFront();

    return polyline;
};

var recurse = function(lines, x0, xl) {
    if (lines.length === 1) {
	return [make_seg(x0, xl, lines[0])];
    }

    if (lines.length === 2) {
	var xint = get_inter_x(lines[0], lines[1]);

	if (xint <= x0) { /* only right line is showing */
	    return [make_seg(x0, xl, lines[1])];
	} else if (xint >= xl) { /* only left line is showing */
	    return [make_seg(x0, xl, lines[0])];
	} else {
	    return [
		make_seg(x0, xint, lines[0]),
		make_seg(xint, xl, lines[1])
	    ];
	}
    }

    /* divide */
    var half = (lines.length / 2) >> 0; /* >> 0 for decimal trunc */
    var lseg = recurse(lines.slice(0, half), x0, xl);
    var rseg = recurse(lines.slice(half), x0, xl);

    /* merge */
    var k1 = 0;
    var k2 = 0;

    var intersection = [];
    while (k1 < lseg.length && k2 < rseg.length) {
	intersection = seg_intersection(lseg[k1], rseg[k2]);
	if (intersection.length > 0)
	    break;

	(lseg[k1].to[0] < rseg[k2].to[0]) ? k1++ : k2++;
    }

    if (intersection.length === 0) /* intersection out of screen */
	return (lseg[0].from[1] > rseg[0].from[1] ? lseg : rseg);

    /* build new segment */
    var segment = lseg.slice(0, k1);
    /* left seg to intersection */
    segment.push(make_seg(lseg[k1].from[0], intersection[0], lseg[k1].line));
    /* intersection to right seg */
    segment.push(make_seg(intersection[0], rseg[k2].to[0], rseg[k2].line));
    segment = segment.concat(rseg.slice(k2 + 1));

    return segment;
};

var calculate = function() {
    if (calculated)
	return;

    if (pnts.length !== 0) {
	for (var i = 0; i < pnts.length; i++)
	    canvas.remove(pnts[i]);
	pnts.length = 0;
    }

    if (input_lines.length === 0) {
	alert("No lines given!");
	return;
    }

    calculated = true;
    input_lines.sort((l1, l2) => {
	if (l1.slope == l2.slope)
	    return l2.intercept - l1.intercept;
	return l1.slope - l2.slope;
    });

    /* only choose highest y intercept for parallel lines */
    rm_parallel(input_lines);

    var answer = recurse(input_lines, 0, screen.width);
    if (answer.length == 0)
	return;

    /* draw answer */
    draw_poly(answer, 'red');
    input_lines.length = 0;
};
