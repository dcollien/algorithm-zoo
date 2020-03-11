import { VectLike, v } from "../../utils/vector";
import { M } from "../../utils/math";
import { IRRTOptions, ExtendFunc } from "./RRT";
import { plotLine, plotCircle } from "../../utils/pixelGeometry";
import { getPixelColor } from "../../utils/imageData";

type IsEmptyFunc = (color: { r: number; g: number; b: number; a?: number }) => boolean;

const extendLine = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number
): ExtendFunc<VectLike> => (from, to) => {
  const linePixels = plotLine(from.x, from.y, to.x, to.y);

  let destination = linePixels[0];

  for (let i = 0; i < linePixels.length; i++) {
    const pixel = linePixels[i];
    if (v.dist(from, pixel) > maxDistance) {
      break;
    }

    destination = pixel;

    const circlePixels = plotCircle(pixel.x, pixel.y, radius);

    const isCollided = circlePixels.some((point) => {
      const color = getPixelColor(imageData, pixel.x, pixel.y);
      return !isEmpty(color);
    });

    if (isCollided) {
      break;
    }
  }
  return [destination, v.dist(destination, goal) < radius];
};

const euclideanDist = (from: VectLike, to: VectLike) => v.dist(from, to);

const randomPoint = (width: number, height: number) => () =>
  v(M.randInt(width), M.randInt(height));

export const holonomic2dConfig = (
  imageData: ImageData,
  goal: VectLike,
  radius: number,
  isEmpty: IsEmptyFunc,
  maxDistance: number,
  maxIterations: number
): IRRTOptions<VectLike> => ({
  random: randomPoint(imageData.width, imageData.height),
  extend: extendLine(imageData, goal, radius, isEmpty, maxDistance),
  distance: euclideanDist,
  maxIterations
});
