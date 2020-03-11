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
) => {
  const rowRange = Math.abs(y2 - y1);
  const rowStart = Math.min(y1, y2);
  const rowEnd = rowStart + rowRange;
  const colRange = Math.abs(x2 - x1);
  const colStart = Math.min(x1, x2);
  const colEnd = colStart + colRange;

  const output = new Array<Pixel>();
  for (let y = rowStart; y < rowEnd; y++) {
    for (let x = colStart; x < colEnd; x++) {
      const color = getPixelColor(imageData, x, y);
      output.push({
        color,
        x,
        y
      });
    }
  }

  return output;
};

export const isMatchingColor = (
  colA: PixelColor,
  colB: PixelColor
) =>
  colA.r === colB.r &&
  colA.g === colB.g &&
  colA.b === colB.b &&
  (colA.a === undefined || colB.a === undefined || colA.a === colB.a);
