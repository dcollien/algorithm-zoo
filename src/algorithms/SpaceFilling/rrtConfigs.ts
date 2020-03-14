import { VectLike, v } from "../../utils/vector";
import { M } from "../../utils/math";
import { IRRTOptions, ExtendFunc } from "./RRT";
import { plotLine, plotCircle } from "../../utils/pixelGeometry";
import { getPixelColor } from "../../utils/imageData";
import { dubinsShortestPath, plotDubinsPathGen, dubinsPathLength } from "../../utils/dubins";

export interface RrtNode {
  x: number;
  y: number;
  angle: number;
}

type IsEmptyFunc = (color: {
  r: number;
  g: number;
  b: number;
  a?: number;
}) => boolean;

const minDist = 2;

const testCollision = (imageData: ImageData, isEmpty: IsEmptyFunc, config: RrtNode | VectLike, radius: number) => {
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
): ExtendFunc<RrtNode, VectLike> => (from, to) => {
  const linePixels = plotLine(from.x, from.y, to.x, to.y);

  let destination = linePixels[0];

  for (let i = 0; i < linePixels.length; i++) {
    const pixel = linePixels[i];
    if (v.dist(from, pixel) > maxDistance) {
      break;
    }

    if (testCollision(imageData, isEmpty, pixel, radius)) {
      break;
    }

    destination = pixel;
  }

  const newNode =
    v.dist(destination, from) > minDist
      ? {
          x: destination.x,
          y: destination.y,
          angle: v.sub(from, to).angle()
        }
      : null;

  return [newNode, v.dist(destination, goal) < radius, undefined];
};

const euclideanDist = (from: VectLike, to: VectLike) => v.dist(from, to);

const goalBiasRandomConfig = (
  width: number,
  height: number,
  goal: VectLike,
  bias: number
) => () =>
  Math.random() < bias ? {
    x: goal.x,
    y: goal.y,
    angle: Math.random() * M.TAU
  } : {
    x: M.randInt(width),
    y: M.randInt(height),
    angle: Math.random() * M.TAU
  };

export const holonomic2dConfig = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  maxIterations: number,
  goalBias=0
): IRRTOptions<RrtNode, RrtNode> => ({
  random: goalBiasRandomConfig(
    imageData.width,
    imageData.height,
    goal,
    goalBias
  ),
  extend: extendLine(imageData, goal, radius, isEmpty, maxDistance),
  distance: euclideanDist,
  maxIterations
});

const extendDubinsPath = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  turnRadius: number
): ExtendFunc<RrtNode, RrtNode> => (from, to) => {
  const path = dubinsShortestPath(from, to, turnRadius);
  const pathSamplesGenerator = plotDubinsPathGen(path, 1);
  const pathSamples = []
  
  let lastSample: RrtNode | null = null;
  for (const sample of pathSamplesGenerator) {
    if (v.dist(from, sample) > maxDistance) {
      break;
    }
    if (testCollision(imageData, isEmpty, sample, radius)) {
      break;
    }

    lastSample = sample;
    pathSamples.push(lastSample);
  }

  return [lastSample, lastSample !== null && v.dist(lastSample, goal) < radius, pathSamples];
};

const dubinsLength = (turnRadius: number) => (from: RrtNode, to: RrtNode) => {
  const path = dubinsShortestPath(from, to, turnRadius);
  return dubinsPathLength(path);
};

export const dubins2dConfig = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  maxIterations: number,
  turnRadius: number,
  goalBias=0,
): IRRTOptions<RrtNode, RrtNode> => ({
  random: goalBiasRandomConfig(
    imageData.width,
    imageData.height,
    goal,
    goalBias
  ),
  extend: extendDubinsPath(imageData, goal, radius, isEmpty, maxDistance, turnRadius),
  distance: dubinsLength(turnRadius),
  maxIterations
});
