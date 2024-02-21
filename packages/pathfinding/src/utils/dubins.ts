import { M } from "./math";
import { v } from "./vector";

enum DubinsPathType {
  LSL = 0,
  LSR = 1,
  RSL = 2,
  RSR = 3,
  RLR = 4,
  LRL = 5
}

const NUM_TYPES = 6;

enum SegmentType {
  L_SEG = 0,
  S_SEG = 1,
  R_SEG = 2
}

const DIRECTIONS = {
  [DubinsPathType.LSL]: [
    SegmentType.L_SEG,
    SegmentType.S_SEG,
    SegmentType.L_SEG
  ],
  [DubinsPathType.LSR]: [
    SegmentType.L_SEG,
    SegmentType.S_SEG,
    SegmentType.R_SEG
  ],
  [DubinsPathType.RSL]: [
    SegmentType.R_SEG,
    SegmentType.S_SEG,
    SegmentType.L_SEG
  ],
  [DubinsPathType.RSR]: [
    SegmentType.R_SEG,
    SegmentType.S_SEG,
    SegmentType.R_SEG
  ],
  [DubinsPathType.RLR]: [
    SegmentType.R_SEG,
    SegmentType.L_SEG,
    SegmentType.R_SEG
  ],
  [DubinsPathType.LRL]: [
    SegmentType.L_SEG,
    SegmentType.R_SEG,
    SegmentType.L_SEG
  ]
};

export interface IDubinsNode {
  x: number;
  y: number;
  angle: number;
}

type SegmentLengths = [number, number, number];

interface IDubinsPath {
  qi: IDubinsNode;
  segmentLengths: SegmentLengths;
  rho: number;
  type: DubinsPathType;
}

interface IDubinsIntermediate {
  alpha: number;
  beta: number;
  d: number;
  sinA: number;
  sinB: number;
  cosA: number;
  cosB: number;
  cosASubB: number;
  dSq: number;
}

function dubinsIntermediate(
  q0: IDubinsNode,
  q1: IDubinsNode,
  rho: number
): IDubinsIntermediate {
  if (rho <= 0.0) {
    throw new Error("Rho is negative");
  }

  const dq = v.sub(q1, q0);

  const d = dq.len() / rho;

  const theta = d > 0 ? M.modCircle(dq.angle()) : 0;
  const alpha = M.modCircle(q0.angle - theta);
  const beta = M.modCircle(q1.angle - theta);

  return {
    alpha,
    beta,
    d,
    sinA: Math.sin(alpha),
    sinB: Math.sin(beta),
    cosA: Math.cos(alpha),
    cosB: Math.cos(beta),
    cosASubB: Math.cos(alpha - beta),
    dSq: d * d
  };
}

function dubinsLSL(ins: IDubinsIntermediate): SegmentLengths {
  const tmp0 = ins.d + ins.sinA - ins.sinB;
  const pSq =
    2 + ins.dSq - 2 * ins.cosASubB + 2 * ins.d * (ins.sinA - ins.sinB);

  if (pSq >= 0) {
    const tmp1 = Math.atan2(ins.cosB - ins.cosA, tmp0);
    return [
      M.modCircle(tmp1 - ins.alpha),
      Math.sqrt(pSq),
      M.modCircle(ins.beta - tmp1)
    ];
  }

  throw new Error("No path");
}

function dubinsRSL(ins: IDubinsIntermediate): SegmentLengths {
  const pSq =
    -2 + ins.dSq + 2 * ins.cosASubB - 2 * ins.d * (ins.sinA + ins.sinB);
  if (pSq >= 0) {
    const p = Math.sqrt(pSq);
    const tmp0 =
      Math.atan2(ins.cosA + ins.cosB, ins.d - ins.sinA - ins.sinB) -
      Math.atan2(2.0, p);
    return [M.modCircle(ins.alpha - tmp0), p, M.modCircle(ins.beta - tmp0)];
  }

  throw new Error("No path");
}

function dubinsLSR(ins: IDubinsIntermediate): SegmentLengths {
  const pSq =
    -2 + ins.dSq + 2 * ins.cosASubB + 2 * ins.d * (ins.sinA + ins.sinB);
  if (pSq >= 0) {
    const p = Math.sqrt(pSq);
    const tmp0 =
      Math.atan2(-ins.cosA - ins.cosB, ins.d + ins.sinA + ins.sinB) -
      Math.atan2(-2.0, p);
    return [
      M.modCircle(tmp0 - ins.alpha),
      p,
      M.modCircle(tmp0 - M.modCircle(ins.beta))
    ];
  }

  throw new Error("No path");
}

function dubinsRSR(ins: IDubinsIntermediate): SegmentLengths {
  const tmp0 = ins.d - ins.sinA + ins.sinB;
  const pSq =
    2 + ins.dSq - 2 * ins.cosASubB + 2 * ins.d * (ins.sinB - ins.sinA);
  if (pSq >= 0) {
    const tmp1 = Math.atan2(ins.cosA - ins.cosB, tmp0);
    return [
      M.modCircle(ins.alpha - tmp1),
      Math.sqrt(pSq),
      M.modCircle(tmp1 - ins.beta)
    ];
  }

  throw new Error("No path");
}

function dubinsLRL(ins: IDubinsIntermediate): SegmentLengths {
  const tmp0 =
    (6.0 - ins.dSq + 2 * ins.cosASubB + 2 * ins.d * (ins.sinB - ins.sinA)) /
    8.0;
  const phi = Math.atan2(ins.cosA - ins.cosB, ins.d + ins.sinA - ins.sinB);
  if (Math.abs(tmp0) <= 1) {
    const p = M.modCircle(M.TAU - Math.acos(tmp0));
    const t = M.modCircle(-ins.alpha - phi + p / 2.0);
    return [
      t,
      p,
      M.modCircle(M.modCircle(ins.beta) - ins.alpha - t + M.modCircle(p))
    ];
  }

  throw new Error("No path");
}

function dubinsRLR(ins: IDubinsIntermediate): SegmentLengths {
  const tmp0 =
    (6.0 - ins.dSq + 2 * ins.cosASubB + 2 * ins.d * (ins.sinA - ins.sinB)) /
    8.0;
  const phi = Math.atan2(ins.cosA - ins.cosB, ins.d - ins.sinA + ins.sinB);
  if (Math.abs(tmp0) <= 1) {
    const p = M.modCircle(M.TAU - Math.acos(tmp0));
    const t = M.modCircle(ins.alpha - phi + M.modCircle(p / 2.0));
    return [t, p, M.modCircle(ins.alpha - ins.beta - t + M.modCircle(p))];
  }

  throw new Error("No path");
}

const dubinsWords = {
  [DubinsPathType.LSL]: dubinsLSL,
  [DubinsPathType.RSL]: dubinsRSL,
  [DubinsPathType.LSR]: dubinsLSR,
  [DubinsPathType.RSR]: dubinsRSR,
  [DubinsPathType.LRL]: dubinsLRL,
  [DubinsPathType.RLR]: dubinsRLR
};

export function dubinsShortestPath(
  q0: IDubinsNode,
  q1: IDubinsNode,
  rho: number
) {
  const path: IDubinsPath = {
    qi: { ...q0 },
    rho,
    segmentLengths: [0, 0, 0],
    type: 0
  };

  const intermediates = dubinsIntermediate(q0, q1, rho);

  let bestCost = Number.POSITIVE_INFINITY;
  let bestWord = -1;

  for (let i = 0; i < NUM_TYPES; i++) {
    const type: DubinsPathType = i;

    try {
      const segmentLengths = dubinsWords[type](intermediates);
      const cost = M.sum(...segmentLengths);
      if (cost < bestCost) {
        bestWord = i;
        bestCost = cost;
        path.segmentLengths = segmentLengths;
        path.type = type;
      }
    } catch (err) {
      // continue
    }
  }

  if (bestWord === -1) {
    throw new Error("No path");
  }

  return path;
}

export function dubinsPathLength(path: IDubinsPath) {
  return M.sum(...path.segmentLengths) * path.rho;
}

const SEGMENTS = {
  [SegmentType.L_SEG]: (t: number, qi: IDubinsNode): IDubinsNode => {
    return {
      x: Math.sin(qi.angle + t) - Math.sin(qi.angle) + qi.x,
      y: -Math.cos(qi.angle + t) + Math.cos(qi.angle) + qi.y,
      angle: t + qi.angle
    };
  },
  [SegmentType.R_SEG]: (t: number, qi: IDubinsNode): IDubinsNode => {
    return {
      x: -Math.sin(qi.angle - t) + Math.sin(qi.angle) + qi.x,
      y: Math.cos(qi.angle - t) - Math.cos(qi.angle) + qi.y,
      angle: -t + qi.angle
    };
  },
  [SegmentType.S_SEG]: (t: number, qi: IDubinsNode): IDubinsNode => {
    return {
      x: Math.cos(qi.angle) * t + qi.x,
      y: Math.sin(qi.angle) * t + qi.y,
      angle: qi.angle
    };
  }
};

function dubinsSegment(
  t: number,
  qi: IDubinsNode,
  type: SegmentType
): IDubinsNode {
  return SEGMENTS[type](t, qi);
}

export function dubinsPathSample(path: IDubinsPath, t: number) {
  /* tprime is the normalised variant of the parameter t */
  const tprime = t / path.rho;
  const types = DIRECTIONS[path.type];

  if (t < 0 || t > dubinsPathLength(path)) {
    throw new Error("Path parameterisation error");
  }

  /* initial configuration */
  const qi: IDubinsNode = { x: 0.0, y: 0.0, angle: path.qi.angle };

  /* generate the target configuration */
  const p1 = path.segmentLengths[0];
  const p2 = path.segmentLengths[1];

  const q1 = dubinsSegment(p1, qi, types[0]);
  const q2 = dubinsSegment(p2, q1, types[1]);

  let q;
  if (tprime < p1) {
    q = dubinsSegment(tprime, qi, types[0]);
  } else if (tprime < p1 + p2) {
    q = dubinsSegment(tprime - p1, q1, types[1]);
  } else {
    q = dubinsSegment(tprime - p1 - p2, q2, types[2]);
  }

  /* scale the target configuration, translate back to the original starting point */
  return {
    x: q.x * path.rho + path.qi.x,
    y: q.y * path.rho + path.qi.y,
    angle: M.modCircle(q.angle)
  };
}

export const plotDubinsPathGen = function*(
  path: IDubinsPath,
  stepSize: number
) {
  let t = 0.0;
  const length = dubinsPathLength(path);

  while (t < length) {
    yield dubinsPathSample(path, t);
    t += stepSize;
  }
};
