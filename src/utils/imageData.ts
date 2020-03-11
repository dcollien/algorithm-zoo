import { plotRect } from "./pixelGeometry";

export interface PixelColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface Pixel {
  x: number;
  y: number;
  color: PixelColor;
}

export const getPixelColor = (
  imageData: ImageData,
  x: number,
  y: number
): PixelColor => {
  const index = 4 * (x + y * imageData.width);
  const data = imageData.data;
  if (index < 0 || index + 3 > data.length) {
    throw new Error(`Unable to retrieve pixel at (${x}, ${y})`);
  }
  return {
    r: data[index],
    g: data[index + 1],
    b: data[index + 2],
    a: data[index + 3]
  };
};

export const getRect = (
  imageData: ImageData,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) =>
  plotRect(x1, y1, x2, y2).map(({ x, y }) => ({
    color: getPixelColor(imageData, x, y),
    x,
    y
  }));

export const isMatchingColor = (colA: PixelColor, colB: PixelColor) =>
  colA.r === colB.r &&
  colA.g === colB.g &&
  colA.b === colB.b &&
  (colA.a === undefined || colB.a === undefined || colA.a === colB.a);
