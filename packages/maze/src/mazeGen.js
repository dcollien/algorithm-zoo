function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export default {
  empty(width, height, isGraph, isWeighted) {
    const maze = Array(width * height).fill(255);

    const set = (x, y, val) => {
      maze[y * width + x] = val;
    };

    set(1, 1, -1);
    set(width-2, height-2, -2);

    return maze;
  },

  alternating(width, height, isGraph, isWeighted) {
    const maze = Array(width * height).fill(255);

    const set = (x, y, val) => {
      maze[y * width + x] = val;
    };

    for (let x = 0; x !== width; ++x) {
      for (let y = 0; y !== height; ++y) {
        if (x % 2 === 0 && y % 2 === 0) {
          set(x, y, 0);
        }
      }
    }

    set(Math.floor(width/2), Math.floor(height/2), -1);
    set(width-2, height-2, -2);

    return maze;
  },

  circle(width, height, isGraph, isWeighted) {
    const maze = Array(width * height).fill(0);

    const get = (x, y) => maze[y * width + x];
    const set = (x, y, val) => {
      maze[y * width + x] = val;
    };

    const n = isGraph ? 2 : 1;

    let shade = 255;
    let offset = 1;
    let i, border, placementX, placementY;

    border = -1;
    while ((width - offset * 2) > 0 && (height - offset * 2) > 0) {
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
          shade = getRandomInt(100, 255);
        }

        placementX = getRandomInt(offset, width - offset);
        placementY = getRandomInt(offset, height - offset);

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

        if (isGraph && border !== -1) {
          border = getRandomInt(0, 4);
        } else {
          border = (border + 1) % 4;
        }

        if (offset === 1) {
          break;
        }
      }


      offset += 2;
    }

    set(1, 1, -1);
    set(Math.floor(width/2), Math.floor(height/2), -2)

    return maze;
  },

  path(width, height, isGraph, isWeighted) {
    const maze = Array(width * height).fill(0);

    const get = (x, y) => maze[y * width + x];
    const set = (x, y, val) => {
      maze[y * width + x] = val;
    };

    const moves = [];

    let possibleDirections, x2, y2, direction, back;

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

    set(x, y, shade);
    moves.push(x + x * width);
    while (moves.length) {
      if (isWeighted) {
        shade = getRandomInt(200, 255);
      }
      possibleDirections = "";

      if (y+2 > 0 && y + 2 < height - 1 && get(x, y + 2) === 0){
        possibleDirections += "S";
      }
      if (y-2 > 0 && y - 2 < height - 1 && get(x, y - 2) === 0){
        possibleDirections += "N";
      }
      if (x-2 > 0 && x - 2 < width - 1 && get(x - 2, y) === 0){
        possibleDirections += "W";
      }
      if (x+2 > 0 && x + 2 < width - 1 && get(x + 2, y) === 0){
        possibleDirections += "E";
      }

      if (possibleDirections) {
        direction = possibleDirections[getRandomInt(0, possibleDirections.length)];
        actions[direction]();
        moves.push(x + y * width);
      } else {
        back = moves.pop();
        y = Math.floor(back / width);
        x = back % width;
      }
    }

    if (isGraph) {
      for (let i = 0; i < maze.length; ++i) {
        y = Math.floor(i / width);
        x = (i % width);
        if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {

        } else if (Math.random() * 100 < 10) {
          if (isWeighted) {
            maze[i] = getRandomInt(200, 255);
          } else {
            maze[i] = 255;
          }
        }
      }
    }


    set(1, 1, -1);
    set(width-2, height-2, -2);

    return maze;
  }
};
