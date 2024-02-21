import { VectLike, v } from "../../utils/vector";
import { M } from "../../utils/math";
import { ExtendFunc, IRRTStarOptions } from "./RRT";
import { plotLine, plotCircle } from "../../utils/pixelGeometry";
import { getPixelColor } from "../../utils/imageData";
import { dubinsShortestPath, dubinsPathLength, dubinsPathSample } from "../../utils/dubins";

export interface RotationalAgentState {
  x: number;
  y: number;
  angle: number;
}

export type IsEmptyFunc = (color: {
  r: number;
  g: number;
  b: number;
  a?: number;
}) => boolean;

export interface IAlgorithmParameters  {
  floorplanImage: ImageData,
  goal: RotationalAgentState,
  agentRadius: number,
  isEmpty: IsEmptyFunc,
  maxExplorationDistance: number,
  maxIterations: number,
  turnRadius?: number,
  goalBias?: number,
  neighbourhoodRadius?: number
};

const testCollisionCircle = (imageData: ImageData, isEmpty: IsEmptyFunc, config: VectLike, radius: number) => {
  const circlePixels = plotCircle(Math.floor(config.x), Math.floor(config.y), radius);
  return circlePixels.some(point => {
    const color = getPixelColor(imageData, point.x, point.y);
    return !isEmpty(color);
  });
};

const extendLine = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number
): ExtendFunc<RotationalAgentState> => (from, to) => {
  const linePixels = plotLine(from.x, from.y, to.x, to.y);

  let destination = linePixels[0];
  let canConnect = true;
  let stopPixel = null;

  for (let i = 0; i < linePixels.length; i++) {
    const pixel = linePixels[i];
    if (v.dist(from, pixel) > maxDistance) {
      break;
    }
    if (testCollisionCircle(imageData, isEmpty, pixel, radius)) {
      canConnect = false;
      break;
    }
    stopPixel = pixel;
  }

  const newNode = canConnect && stopPixel ? {
    x: stopPixel.x,
    y: stopPixel.y,
    angle: 0
  } : undefined;

  return {
    newNode,
    isGoal: v.dist2(destination, goal) < radius * radius
  };
};

const euclideanDist = (from: VectLike, to: VectLike) => v.dist(from, to);

const goalBiasRandomConfig = (
  width: number,
  height: number,
  goal: RotationalAgentState,
  bias: number
) => () =>
  Math.random() < bias ? {
    x: goal.x + M.vary(0.1),
    y: goal.y + M.vary(0.1),
    angle: goal.angle + M.vary(0.1),
  } : {
    x: M.randInt(width),
    y: M.randInt(height),
    angle: Math.random() * M.TAU
  };

export const holonomic2dConfig = (params: IAlgorithmParameters): IRRTStarOptions<RotationalAgentState> => ({
  random: goalBiasRandomConfig(
    params.floorplanImage.width,
    params.floorplanImage.height,
    params.goal,
    params.goalBias === undefined ? 0 : params.goalBias
  ),
  extend: extendLine(params.floorplanImage, params.goal, params.agentRadius, params.isEmpty, params.maxExplorationDistance),
  distance: euclideanDist,
  maxIterations: params.maxIterations,
  radius: params.neighbourhoodRadius || params.maxExplorationDistance * 2,
});

const dubinsSample = (params: IAlgorithmParameters) => (from: RotationalAgentState, to: RotationalAgentState) => {
  const path = dubinsShortestPath(from, to, params.turnRadius || 20);
  const pathLength = dubinsPathLength(path);
  const samples: RotationalAgentState[] = [];
  let t = 0;
  while (t < pathLength) {
    samples.push(dubinsPathSample(path, t));
    t += 1.0;
  }
  return samples;
}

const extendDubinsPath = (params: IAlgorithmParameters): ExtendFunc<RotationalAgentState> => (from, to) => {
  const turnRadius = params.turnRadius || 20;
  const path = dubinsShortestPath(from, to, turnRadius);
  const pathLength = dubinsPathLength(path);
  const stepSize = 1;
  const pathSamples = []
  const maxDist = params.maxExplorationDistance;
  
  let t = 0;
  let canConnect = true;
  let sample: RotationalAgentState | undefined;
  while (t < pathLength) {
    sample = dubinsPathSample(path, t);
    if (t >= maxDist) {
      break;
    }
    if (testCollisionCircle(params.floorplanImage, params.isEmpty, sample, params.agentRadius)) {
      canConnect = false;
      break;
    }

    pathSamples.push(sample);
    t += stepSize;
  }

  let isGoal = false;
  if (!canConnect) {
    sample = undefined;
  } else if (sample) {
    const goalPath = dubinsShortestPath(sample, params.goal, turnRadius);
    isGoal = dubinsPathLength(goalPath) <= (params.agentRadius);
    isGoal = isGoal || (v.dist(sample, params.goal) < params.agentRadius && Math.abs(params.goal.angle - sample.angle) < M.TAU/8);
  }

  return {
    isGoal,
    samples: pathSamples,
    newNode: sample
  }
};

const dubinsLength = (turnRadius: number) => (from: RotationalAgentState, to: RotationalAgentState) => {
  const path = dubinsShortestPath(from, to, turnRadius);
  return dubinsPathLength(path);
};

export const dubins2dConfig = (params: IAlgorithmParameters): IRRTStarOptions<RotationalAgentState> => ({
  random: goalBiasRandomConfig(
    params.floorplanImage.width,
    params.floorplanImage.height,
    params.goal,
    params.goalBias || 0
  ),
  extend: extendDubinsPath(params),
  sample: dubinsSample(params),
  distance: dubinsLength(params.turnRadius || 20),
  maxIterations: params.maxIterations,
  radius: params.neighbourhoodRadius || params.maxExplorationDistance * 2,
});
