import { VectLike, v } from "../../utils/vector";
import { M } from "../../utils/math";
import { IRRTOptions, ExtendFunc } from "./RRT";
import { plotLine, plotCircle } from "../../utils/pixelGeometry";
import { getPixelColor } from "../../utils/imageData";

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
    const circlePixels = plotCircle(pixel.x, pixel.y, radius);

    const isCollided = circlePixels.some(point => {
      const color = getPixelColor(imageData, point.x, point.y);
      return !isEmpty(color);
    });

    if (isCollided) {
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

  return [newNode, v.dist(destination, goal) < radius];
};

const euclideanDist = (from: VectLike, to: VectLike) => v.dist(from, to);

const randomPoint = (width: number, height: number) => () =>
  v(M.randInt(width), M.randInt(height));

const goalBiasRandomPoint = (
  width: number,
  height: number,
  goal: VectLike,
  bias: number
) => () =>
  Math.random() < bias ? goal : v(M.randInt(width), M.randInt(height));

export const holonomic2dConfig = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  maxIterations: number
): IRRTOptions<RrtNode, VectLike> => ({
  random: randomPoint(imageData.width, imageData.height),
  extend: extendLine(imageData, goal, radius, isEmpty, maxDistance),
  distance: euclideanDist,
  maxIterations
});

export const holonomic2dConfigGoalBias = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  maxIterations: number,
  goalBias: number
): IRRTOptions<RrtNode, VectLike> => ({
  random: goalBiasRandomPoint(
    imageData.width,
    imageData.height,
    goal,
    goalBias
  ),
  extend: extendLine(imageData, goal, radius, isEmpty, maxDistance),
  distance: euclideanDist,
  maxIterations
});
