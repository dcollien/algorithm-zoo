import { M } from "./math";

export type MazeBuilder = (width: number, height: number) => Array<number>[];
export const START = -1;
export const GOAL = -2;


export const empty: MazeBuilder = (width, height) => {
  const maze = Array(width * height).fill(255);

  const set = (x: number, y: number, val: number) => {
    maze[y * width + x] = val;
  };

  set(1, 1, START);
  set(width - 2, height - 2, GOAL);

  return maze;
};

export const filled: MazeBuilder = (width, height) => {
  const maze = Array(width * height).fill(0);

  const set = (x: number, y: number, val: number) => {
    maze[y * width + x] = val;
  };

  set(1, 1, START);
  set(width - 2, height - 2, GOAL);

  return maze;
};

const concentric = (
  width: number,
  height: number,
  isTree: boolean,
  isWeighted: boolean
) => {
  const maze = Array(width * height).fill(0);

  //const get = (x: number, y: number) => maze[y * width + x];
  const set = (x: number, y: number, val: number) => {
    maze[y * width + x] = val;
  };

  const n = isTree ? 1 : 2;

  let shade = 255;
  let offset = 1;
  let i, border, placementX, placementY;

  border = -1;
  while (width - offset * 2 > 0 && height - offset * 2 > 0) {
    i = offset;
    while (i < width - offset) {
      set(i, offset, 255);
      set(i, height - offset - 1, 255);

      ++i;
    }

    i = offset;
    while (i < height - offset) {
      set(offset, i, 255);
      set(width - offset - 1, i, 255);

      ++i;
    }

    for (i = 0; i < n; ++i) {
      if (isWeighted) {
        shade = M.randIntRange(100, 255);
      }

      placementX = M.randIntRange(offset, width - offset);
      placementY = M.randIntRange(offset, height - offset);

      switch (border) {
        case 0:
          set(placementX, offset - 1, shade);
          break;
        case 1:
          set(placementX, height - offset, shade);
          break;
        case 2:
          set(offset - 1, placementY, shade);
          break;
        case 3:
          set(width - offset, placementY, shade);
          break;
      }

      if (!isTree && border !== -1) {
        border = M.randIntRange(0, 4);
      } else {
        border = (border + 1) % 4;
      }

      if (offset === 1) {
        break;
      }
    }

    offset += 2;
  }

  set(1, 1, START);
  set(Math.floor(width / 2), Math.floor(height / 2), GOAL);

  return maze;
};

export const concentricTree: MazeBuilder = (width, height) => {
  return concentric(width, height, true, false);
};

export const concentricWeightedTree: MazeBuilder = (width, height) => {
  return concentric(width, height, true, true);
};

export const concentricGraph: MazeBuilder = (width, height) => {
  return concentric(width, height, false, false);
};

export const concentricWeightedGraph: MazeBuilder = (width, height) => {
  return concentric(width, height, false, true);
};

enum Direction {
  N = "N",
  S = "S",
  E = "E",
  W = "W"
}

const windingPath = (
  width: number,
  height: number,
  isTree: boolean,
  isWeighted: boolean
) => {
  const maze = Array(width * height).fill(0);

  const get = (x: number, y: number) => maze[y * width + x];
  const set = (x: number, y: number, val: number) => {
    maze[y * width + x] = val;
  };

  const moves: number[] = [];

  let shade = 255;
  let x = 1;
  let y = 1;

  const actions = {
    N() {
      set(x, y - 2, shade);
      set(x, y - 1, shade);
      y -= 2;
    },

    S() {
      set(x, y + 2, shade);
      set(x, y + 1, shade);
      y += 2;
    },

    W() {
      set(x - 2, y, shade);
      set(x - 1, y, shade);
      x -= 2;
    },

    E() {
      set(x + 2, y, shade);
      set(x + 1, y, shade);
      x += 2;
    }
  };

  let possibleDirections: Direction[];
  let direction: Direction;
  let back: number | undefined;

  set(x, y, shade);
  moves.push(x + x * width);
  while (moves.length) {
    if (isWeighted) {
      shade = M.randIntRange(200, 255);
    }
    possibleDirections = [];

    if (y + 2 > 0 && y + 2 < height - 1 && get(x, y + 2) === 0) {
      possibleDirections.push(Direction.S);
    }
    if (y - 2 > 0 && y - 2 < height - 1 && get(x, y - 2) === 0) {
      possibleDirections.push(Direction.N);
    }
    if (x - 2 > 0 && x - 2 < width - 1 && get(x - 2, y) === 0) {
      possibleDirections.push(Direction.W);
    }
    if (x + 2 > 0 && x + 2 < width - 1 && get(x + 2, y) === 0) {
      possibleDirections.push(Direction.E);
    }

    if (possibleDirections.length > 0) {
      direction =
        possibleDirections[M.randIntRange(0, possibleDirections.length)];
      actions[direction]();
      moves.push(x + y * width);
    } else {
      back = moves.pop();
      if (back !== undefined) {
        y = Math.floor(back / width);
        x = back % width;
      }
    }
  }

  if (!isTree) {
    for (let i = 0; i < maze.length; ++i) {
      y = Math.floor(i / width);
      x = i % width;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
      } else if (Math.random() * 100 < 10) {
        if (isWeighted) {
          maze[i] = M.randIntRange(200, 255);
        } else {
          maze[i] = 255;
        }
      }
    }
  }

  set(1, 1, START);
  set(width - 2, height - 2, GOAL);

  return maze;
};

export const windingTree: MazeBuilder = (width: number, height: number) => {
  return windingPath(width, height, true, false);
};

export const windingWeightedTree: MazeBuilder = (
  width: number,
  height: number
) => {
  return windingPath(width, height, true, true);
};

export const windingGraph: MazeBuilder = (width: number, height: number) => {
  return windingPath(width, height, false, false);
};

export const windingWeightedGraph: MazeBuilder = (
  width: number,
  height: number
) => {
  return windingPath(width, height, false, true);
};
