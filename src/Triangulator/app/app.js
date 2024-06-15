"use strict";

function calculate() {
    const degreeOffset = parseInt(document.getElementById("angle-offset").value);

    const x1 = parseInt(document.getElementById("x1").value);
    const y1 = parseInt(document.getElementById("y1").value);
    const unformattedDegrees1 = parseInt(document.getElementById("angle1").value);
    const formattedDegrees1 = formatDegrees(unformattedDegrees1, degreeOffset);
    const angle1 = degreesToRadians(formattedDegrees1);

    const x2 = parseInt(document.getElementById("x2").value);
    const y2 = parseInt(document.getElementById("y2").value);
    const unformattedDegrees2 = parseInt(document.getElementById("angle2").value);
    const formattedDegrees2 = formatDegrees(unformattedDegrees2, degreeOffset);
    const angle2 = degreesToRadians(formattedDegrees2);

    // tangent is slope
    const slope1 = Math.tan(angle1);
    const yIntercept1 = calculateYIntercept(slope1, x1, y1);

    const slope2 = Math.tan(angle2);
    const yIntercept2 = calculateYIntercept(slope2, x2, y2);
    //

    // a, b, c are the variables used in the standard line equation (ax + by + c = 0)
    // b will always be -1 because I am actually using slope-intercept form (y = mx + b)-
    // -with y subtracted (0 = mx - y + b) (m = a, -y = "-1y", b = c) to create (ax + by + c = 0)
    const a1 = slope1;
    const b1 = -1;
    const c1 = yIntercept1;

    const a2 = slope2;
    const b2 = -1;
    const c2 = yIntercept2;
    //

    const triangulatedLocation = calculateLineIntersection(a1, b1, c1, a2, b2, c2);
    const distance = calculateDistance(x2, y2, triangulatedLocation.x, triangulatedLocation.y);

    const resultXText = document.getElementById("result-x");
    const resultYText = document.getElementById("result-y");
    const resultXZYText = document.getElementById("result-xzy");
    const resultPointText = document.getElementById("result-point");

    const resultDistanceText = document.getElementById("result-distance");
    const resultTrajectory1Text = document.getElementById("result-trajectory1");
    const resultTrajectory2Text = document.getElementById("result-trajectory2");
    const resultParsedAngle1 = document.getElementById("result-parsed-angle1");
    const resultParsedAngle2 = document.getElementById("result-parsed-angle2");

    resultXText.textContent = `X: ${triangulatedLocation.x.toFixed(4)}`;
    resultYText.textContent = `Y: ${triangulatedLocation.y.toFixed(4)}`;
    resultXZYText.textContent = `XZY: ${triangulatedLocation.x.toFixed(4)} ~ ${triangulatedLocation.y.toFixed(4)}`;
    resultPointText.textContent = `Point: (${triangulatedLocation.x.toFixed(4)}, ${triangulatedLocation.y.toFixed(4)})`;

    resultDistanceText.textContent = `Distance: ${distance.toFixed(4)}`;
    resultTrajectory1Text.textContent = `Trajectory 1: ${a1.toFixed(4)} * x - y + ${c1.toFixed(4)} = 0`;
    resultTrajectory2Text.textContent = `Trajectory 2: ${a2.toFixed(4)} * x - y + ${c2.toFixed(4)} = 0`;
    resultParsedAngle1.textContent = `Parsed Angle 1: ${formattedDegrees1.toFixed(4)}° (${angle1.toFixed(4)})`;
    resultParsedAngle2.textContent = `Parsed Angle 2: ${formattedDegrees2.toFixed(4)}° (${angle2.toFixed(4)})`;

    const graphCanvas = document.getElementById("graph-canvas");
    const graphContext = graphCanvas.getContext("2d");

    const points = [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        triangulatedLocation
    ];

    const normalizedPoints = normalizePoints(points, graphCanvas.width, graphCanvas.height);

    const normalizedX1 = normalizedPoints[0].x;
    const normalizedY1 = normalizedPoints[0].y;
    const normalizedX2 = normalizedPoints[1].x;
    const normalizedY2 = normalizedPoints[1].y;
    const normalizedTriangulatedLocation = normalizedPoints[2];

    graphContext.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    graphContext.fillStyle = "#1c1c1c";
    graphContext.fillRect(0, 0, graphCanvas.width, graphCanvas.height);
    drawLine(normalizedX1, graphCanvas.height - normalizedY1, normalizedTriangulatedLocation.x, graphCanvas.height - normalizedTriangulatedLocation.y, "#ffffff", graphContext);
    drawLine(normalizedX2, graphCanvas.height - normalizedY2, normalizedTriangulatedLocation.x, graphCanvas.height - normalizedTriangulatedLocation.y, "#ffffff", graphContext);

    drawPoint(normalizedX1, graphCanvas.height - normalizedY1, 10, "#0fffd3", `(${x1}, ${y1})`, "#f0002c", graphContext);
    drawPoint(normalizedX2, graphCanvas.height - normalizedY2, 10, "#0fffd3", `(${x2}, ${y2})`, "#f0002c", graphContext);
    drawPoint(normalizedTriangulatedLocation.x, graphCanvas.height - normalizedTriangulatedLocation.y, 20, "#fc267c", `(${triangulatedLocation.x.toFixed(4)}, ${triangulatedLocation.y.toFixed(4)})`, "#03d983", graphContext);
}

function drawLine(x1, y1, x2, y2, color, canvasContext) {
    canvasContext.save();

    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.strokeStyle = color;
    canvasContext.lineWidth = 2;
    canvasContext.stroke();

    canvasContext.restore();
}

function drawPoint(x, y, size, color, label, labelColor, canvasContext) {
    canvasContext.save();

    canvasContext.beginPath();
    canvasContext.arc(x, y, size, 0, 2 * Math.PI, false);
    canvasContext.fillStyle = color;
    canvasContext.fill();
      
    canvasContext.fillStyle = labelColor;
    canvasContext.font = "15px serif";

    const textWidth = canvasContext.measureText(label).width;
    const textHeight = parseInt(canvasContext.font, 10);
    const canvasWidth = canvasContext.canvas.width;
    const canvasHeight = canvasContext.canvas.height;

    const textPositionX = x + textWidth > canvasWidth ? canvasWidth - textWidth - size / 2 : x + size / 2;
    const textPositionY = y <= 0 ? textHeight + size / 2 : y - size / 2;
    canvasContext.fillText(label, textPositionX, textPositionY);

    canvasContext.restore();
}

function normalizePoints(points, canvasWidth, canvasHeight) {
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    let rangeX = maxX - minX;
    let rangeY = maxY - minY;

    rangeX = rangeX === 0 ? 1 : rangeX;
    rangeY = rangeY === 0 ? 1 : rangeY;

    return points.map(p => {
        return {
            x: ((p.x - minX) / rangeX) * canvasWidth,
            y: ((p.y - minY) / rangeY) * canvasHeight
        };
    });
}

function formatDegrees(unformattedDegrees, offset) {
    return (unformattedDegrees + offset) % 360;
}

function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

function calculateYIntercept(m, x, y) {
    return y - m * x;
}

function calculateLineIntersection(a1, b1, c1, a2, b2, c2) {
    // formula from:
    // https://www.geeksforgeeks.org/point-of-intersection-of-two-lines-formula
    const d = (a1 * b2 - a2 * b1);
    const x = (b1 * c2 - b2 * c1) / d;
    const y = (c1 * a2 - c2 * a1) / d;

    return { x, y };
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

document.addEventListener('DOMContentLoaded', function () {
    calculate();

    const textboxes = document.querySelectorAll('input[type="text"]');

    textboxes.forEach(textbox => {
        textbox.addEventListener('input', calculate);
    });
});