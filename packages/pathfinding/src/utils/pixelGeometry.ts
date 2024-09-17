interface Point {
  x: number;
  y: number;
}

export function plotLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): Point[] {
  const plot = [];

  x1 = Math.floor(x1);
  x2 = Math.floor(x2);
  y1 = Math.floor(y1);
  y2 = Math.floor(y2);

  var dx = Math.abs(x2 - x1);
  var dy = Math.abs(y2 - y1);
  var sx = x1 < x2 ? 1 : -1;
  var sy = y1 < y2 ? 1 : -1;
  var err = dx - dy;

  plot.push({ x: x1, y: y1 });

  while (!(x1 === x2 && y1 === y2)) {
    var e2 = err << 1;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
    plot.push({ x: x1, y: y1 });
  }

  return plot;
}

export function plotRect(x1: number, y1: number, x2: number, y2: number) {
  const rowRange = Math.abs(y2 - y1);
  const rowStart = Math.min(y1, y2);
  const rowEnd = rowStart + rowRange;
  const colRange = Math.abs(x2 - x1);
  const colStart = Math.min(x1, x2);
  const colEnd = colStart + colRange;

  const plot = new Array<Point>();
  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = colStart; x < colEnd; x++) {
      plot.push({ x, y });
    }
  }

  return plot;
}

export const plotCircleGen = function*(x1: number, y1: number, radius: number) {
  let x = radius;
  let y = 0;
  let radiusError = 1 - x;

  while (x >= y) {
    yield({ x: x + x1, y: y + y1 });
    yield({ x: y + x1, y: x + y1 });
    yield({ x: -x + x1, y: y + y1 });
    yield({ x: -y + x1, y: x + y1 });
    yield({ x: -x + x1, y: -y + y1 });
    yield({ x: -y + x1, y: -x + y1 });
    yield({ x: x + x1, y: -y + y1 });
    yield({ x: y + x1, y: -x + y1 });
    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    } else {
      x--;
      radiusError += 2 * (y - x + 1);
    }
  }
}

export function plotCircle(x1: number, y1: number, radius: number) {
  let x = radius;
  let y = 0;
  let radiusError = 1 - x;

  const plot = new Array<Point>();

  while (x >= y) {
    plot.push({ x: x + x1, y: y + y1 });
    plot.push({ x: y + x1, y: x + y1 });
    plot.push({ x: -x + x1, y: y + y1 });
    plot.push({ x: -y + x1, y: x + y1 });
    plot.push({ x: -x + x1, y: -y + y1 });
    plot.push({ x: -y + x1, y: -x + y1 });
    plot.push({ x: x + x1, y: -y + y1 });
    plot.push({ x: y + x1, y: -x + y1 });
    y++;

    if (radiusError < 0) {
      radiusError += 2 * y + 1;
    } else {
      x--;
      radiusError += 2 * (y - x + 1);
    }
  }

  return plot;
}
