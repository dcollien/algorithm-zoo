import { M } from "./math";

export class Vect {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  len() {
    return v.len(this);
  }

  len2() {
    return v.len2(this);
  }

  angle() {
    return v.angle(this);
  }

  toString() {
    return [this.x, this.y].join(",");
  }
}

export type VectLike = { x: number; y: number };

const isPoint = (val: any): val is { x: number; y: number } => {
  return typeof val === "object" && val.x !== undefined && val.y !== undefined;
};

export const v = function(
  x: number | { x: number; y: number } | [number, number],
  y?: number
) {
  if (x instanceof Array) {
    return new Vect(x[0], x[1]);
  } else if (isPoint(x)) {
    return new Vect(x.x, x.y);
  } else if (y !== undefined) {
    return new Vect(x, y);
  } else {
    throw new Error("Unknown point format");
  }
};

v.rotate = function(v1: VectLike, v2: VectLike) {
  return v(v1.x * v2.x - v1.y * v2.y, v1.x * v2.y + v1.y * v2.x);
};

v.forAngle = function(a: number, s = 1) {
  return v(Math.cos(a) * s, Math.sin(a) * s);
};

v.add = function(v1: VectLike, v2: VectLike) {
  return v(v1.x + v2.x, v1.y + v2.y);
};

v.sub = function(v1: VectLike, v2: VectLike) {
  return v(v1.x - v2.x, v1.y - v2.y);
};

v.mul = function(v1: VectLike, s: number) {
  return v(v1.x * s, v1.y * s);
};

v.div = function(v1: VectLike, s: number) {
  return v(v1.x / s, v1.y / s);
};

v.dot = function(v1: VectLike, v2: VectLike) {
  return v1.x * v2.x + v1.y * v2.y;
};

v.lerp = function(t: number, v1: VectLike, v2: VectLike) {
  return v(M.lerp(t, v1.x, v2.x), M.lerp(t, v1.y, v2.y));
};

v.eq = function(v1: VectLike, v2: VectLike) {
  return v1.x === v2.x && v1.y === v2.y;
};

v.map = function(f: (value: number) => number, v1: VectLike) {
  return v(f(v1.x), f(v1.y));
};

v.rotateBy = function(v1: VectLike, a: number) {
  return v.rotate(v1, v.forAngle(a));
};

v.dist = function(v1: VectLike, v2: VectLike) {
  return v.sub(v1, v2).len();
};

v.dist2 = function(v1: VectLike, v2: VectLike) {
  return v.sub(v1, v2).len2();
};

v.len = function(v1: VectLike) {
  return Math.sqrt(M.sq(v1.x) + M.sq(v1.y));
};

v.len2 = function(v1: VectLike) {
  return M.sq(v1.x) + M.sq(v1.y);
};

v.angle = function(v1: VectLike) {
  return Math.atan2(v1.y, v1.x);
};

v.unit = function(v1: VectLike) {
  var len;
  len = v.len(v1);
  return v(v1.x / len, v1.y / len);
};

v.scale = function(v1: VectLike, s: number) {
  return v.mul(v.unit(v1), s);
};
