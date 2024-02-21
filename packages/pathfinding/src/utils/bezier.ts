import { M } from "./math";
import { v, VectLike } from "./vector";

/**
 * Find a point along a cubic bezier curve
 * @param t interpolation parameter along the bezier curve
 * @param p0 start point
 * @param p1 control point
 * @param p2 control point
 * @param p3 end point
 */
export function cubicBezier(
  t: number,
  p0: VectLike,
  p1: VectLike,
  p2: VectLike,
  p3: VectLike
) {
  const q0 = v.mul(p0, M.cube(1 - t));
  const q1 = v.mul(p1, 3 * M.sq(1 - t) * t);
  const q2 = v.mul(p2, 3 * (1 - t) * M.sq(t));
  const q3 = v.mul(p3, M.cube(t));

  return v.add(v.add(v.add(q0, q1), q2), q3);
}

/**
 * Searches for a t parameter at a given x coordinate
 * @param x an x-coordinate along the bezier curve
 * @param p0 start
 * @param p1 control point
 * @param p2 control point
 * @param p3 end
 * @param tolerance 
 */
export function cubicBezierAtX(
  x: number,
  p0: VectLike,
  p1: VectLike,
  p2: VectLike,
  p3: VectLike,
  tolerance = 0.05
) {
  let t = 0.5;
  let lower = 0.0;
  let upper = 1.0;

  let result = cubicBezier(t, p0, p1, p2, p3);

  while (Math.abs(result.x - x) > tolerance) {
    if (result.x < x) {
      lower = t;
      t = M.lerp(0.5, t, upper);
    } else {
      upper = t;
      t = M.lerp(0.5, t, lower);
    }
    result = cubicBezier(t, p0, p1, p2, p3);
  }
  return t;
}

/**
 * De Casteljau subdivision splitting a curve in two.
 * These new curves have control points:
 *  [r0, r1], and
 *  [q0, q2]
 * respectively.
 * 
 * @param t parameter of subdivision
 * @param p0 start
 * @param p1 control point
 * @param p2 control point
 * @param p3 end
 */
export function cubicDeCasteljau(
  t: number,
  p0: VectLike,
  p1: VectLike,
  p2: VectLike,
  p3: VectLike
) {
  const q0 = v.lerp(t, p0, p1);
  const q1 = v.lerp(t, p1, p2);
  const q2 = v.lerp(t, p2, p3);
  const r0 = v.lerp(t, q0, q1);
  const r1 = v.lerp(t, q1, q2);
  return [r0, r1, q0, q2];
}

/**
 * Inverse of De Casteljau subdivision
 * 
 * @param t  parameter where curves were subdivided
 * @param p0 first curve's start
 * @param p1 first curve's first control point
 * @param q2 second curve's second control point
 * @param q3 second curve's end
 */
export function invCubicDeCasteljau(
  t: number,
  p0: VectLike,
  p1: VectLike,
  q2: VectLike,
  q3: VectLike
) {
  const r1 = v.div(v.sub(p1, v.mul(p0, 1 - t)), t);
  const r2 = v.div(v.sub(q2, v.mul(q3, t)), 1 - t);
  return [r1, r2];
}

/**
 * Approximate where two curves were subdivided
 * 
 * @param p2 first curve's second control point
 * @param q0 second curve's start
 * @param q1 second curve's first control point
 */
export function approxBezierSubdivisionParameter(
  p2: VectLike,
  q0: VectLike,
  q1: VectLike
) {
  let tX = 0.5;
  let tY = 0.5;

  const yDenom = q1.y - p2.y;
  const xDenom = q1.x - p2.x;

  if (yDenom !== 0) {
    tY = (q0.y - p2.y) / yDenom;
  }

  if (xDenom !== 0) {
    tX = (q0.x - p2.x) / xDenom;
  }

  let t: number;
  if (yDenom === 0) {
    t = tX;
  } else if (xDenom === 0) {
    t = tY;
  } else {
    t = (tX + tY) * 0.5;
  }

  return t;
}

/**
 * Subdivide a bezier into two
 * 
 * @param t  Parameter where to divide the curve
 * @param p0 curve start
 * @param p1 control point
 * @param p2 control point
 * @param p3 curve end
 */
export function subdivideBezier(
  t: number,
  p0: VectLike,
  p1: VectLike,
  p2: VectLike,
  p3: VectLike
) {
  const mid = cubicBezier(t, p0, p1, p2, p3);
  const [r0, r1, q0, q2] = cubicDeCasteljau(t, p0, p1, p2, p3);
  return [
    [p0, r0, r1, mid],
    [mid, q0, q2, p3]
  ];
}

/**
 * Simplify two adjoining curves into one
 * 
 * @param p0 curve 1 start
 * @param p1 curve 1 control point
 * @param p2 curve 1 control point
 * @param p3q0 curve 1 end / curve 2 start
 * @param q1 curve 2 control point
 * @param q2 curve 2 control point
 * @param q3 curve 2 end
 */
export function joinBeziers(
  p0: VectLike,
  p1: VectLike,
  p2: VectLike,
  p3q0: VectLike,
  q1: VectLike,
  q2: VectLike,
  q3: VectLike
) {
  const t = approxBezierSubdivisionParameter(p2, p3q0, q1);
  const [r1, r2] = invCubicDeCasteljau(t, p0, p1, q2, q3);
  return [p0, r1, r2, q3];
}
