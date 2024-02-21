import Game from './game.js';

const START = -1;
const GOAL  = -2;

const dataUrlToBlob = (dataURL, filename) => {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    var blob = new Blob([uInt8Array], {type: contentType});
    blob.name = filename;

    return blob;
};

export default class Maze extends Game {
  constructor(canvas, data, width, height, gridSize=8, onStop=null, onStep=null) {
    super(canvas);

    canvas.width = gridSize * width;
    canvas.height = gridSize * height;

    this.gridSize = gridSize;
    this.mazeData = data;
    this.mazeWidth = width;
    this.mazeHeight = height;
    this.graphics = canvas.getContext('2d');
    this.hasChangedSinceDraw = true;
    this.stepSpeed = 0;
    this.timeToStep = 0;
    this.stateData = null;
    this.onStop = onStop;
    this.onStep = onStep;
    this.yieldsPerStep = 5;
    this.canvas = canvas;
    this.scale = 1;

    window.onresize = () => {
      const aspect = canvas.height / canvas.width;
      if (window.innerWidth <= 920) {
        canvas.style.width = Math.min(canvas.width, (window.innerWidth - 14)) + 'px';
        canvas.style.height = Math.min(canvas.height, (aspect * canvas.offsetWidth)) + 'px';
      } else {
        canvas.style.height = canvas.height + 'px';
        canvas.style.width  = canvas.width + 'px';
      }
      this.scale = canvas.width/canvas.offsetWidth;

      const newHeight = document.getElementById('info-panel').offsetHeight;

      if (window.innerWidth <= 850) {
        document.getElementById('info-container').style.height = newHeight + 'px';
      } else {
        document.getElementById('info-container').style.height = canvas.height + 'px';
      }
    };
    window.onresize();
  }

  fromIndex(index) {
    return {
      y: Math.floor(index / this.mazeWidth),
      x: index % this.mazeWidth
    };
  }

  toIndex(x, y) {
    if (x < 0 || x >= this.mazeWidth) return null;
    if (y < 0 || y >= this.mazeHeight) return null;
    return y * this.mazeWidth + x;
  }

  drawTool(tool, color, x, y) {
    x = Math.floor(x * this.scale / this.gridSize);
    y = Math.floor(y * this.scale / this.gridSize);

    const index = this.toIndex(x, y);
    const indices = [index];
    if (tool === 'large' && color >= 0) {
      indices.push(this.toIndex(x+1, y));
      indices.push(this.toIndex(x, y+1));
      indices.push(this.toIndex(x+1, y+1));
    }

    if (color === START) {
      for (let i = 0; i < this.mazeData.length; ++i) {
        if (this.mazeData[i] === color) {
          this.mazeData[i] = 255;
        }
      }
    }

    for (let squareIndex of indices) {
      this.mazeData[squareIndex] = color;
    }

    this.resetSearch();
    this.hasChangedSinceDraw = true;
  }

  getWeight(index) {
    if (index === null) return null;
    if (0 <= index && index < this.mazeData.length && this.mazeData[index] !== 0) {
      const shade = this.mazeData[index];
      if (shade < 0) return 0;
      if (shade < 96) {
        return 7;
      } else if (shade < 128){
        return 6;
      } else if (shade < 160) {
        return 5;
      } else if (shade < 192) {
        return 4;
      } else if (shade < 224) {
        return 3;
      } else if (shade < 254) {
        return 2;
      } else {
        return 1;
      }
    } else {
      return null;
    }
  }

  setSearchStrategy(search, heuristic='manhatten', bidirectional=false) {
    let start = null
    const goals = new Set();

    if (!this.mazeData.length) {
      return; // ??
    }

    // Find the start and end coordinates;
    for (let i = 0; i !== this.mazeData.length; ++i) {
      if (this.mazeData[i] === START) {
        start = i;
      } else if (this.mazeData[i] === GOAL) {
        goals.add(i);
      }
    }

    const isGoal = (node) => goals.has(node);

    const expandNode = (node) => {
      if (start === null) {
        throw {
          title: "No Starting Location",
          message: "This search needs a place to start."
        };
      }
      if (this.bidirectional) {
        goalChecks();
      }

      const {x, y} = this.fromIndex(node);

      const candidates = [
        this.toIndex(x + 1, y),
        this.toIndex(x - 1, y),
        this.toIndex(x, y + 1),
        this.toIndex(x, y - 1),
      ];

      const weightedCandidates = candidates.map((index) => {
        return {
          node: index,
          weight: this.getWeight(index)
        }
      });

      const filteredCandidates = weightedCandidates.filter((nodeData) => nodeData.weight !== null);

      return filteredCandidates;
    };

    const goalChecks = () => {
      if (goals.size > 1) {
        throw {
          title: "Multiple Goals",
          message: "This search requires there to be only one goal."
        };
      }
      if (goals.size === 0) {
        throw {
          title: "Goal Required",
          message: "This search needs a goal."
        };
      }
    };

    const hFns = {
      manhatten: (node, goal) => {
        const {x, y} = this.fromIndex(node);
        const {x: gx, y: gy} = this.fromIndex(goal);
        return Math.abs(gx - x) + Math.abs(gy - y);
      },
      euclid: (node, goal) => {
        const {x, y} = this.fromIndex(node);
        const {x: gx, y: gy} = this.fromIndex(goal);
        const dx = (gx - x);
        const dy = (gy - y);

        return Math.sqrt(dx*dx + dy*dy);
      }
    };

    const goal = Array.from(goals)[0];

    const heuristics = {
      manhatten: (node) => {
        goalChecks();
        return hFns.manhatten(node, goal);
      },

      euclid: (node) => {
        goalChecks();
        return hFns.euclid(node, goal);
      }
    };

    const reverseHeuristics = {
      manhatten: (node) => hFns.manhatten(node, start),
      euclid: (node) => hFns.euclid(node, start)
    };

    this.heuristic = heuristic;
    this.strategy = search;
    this.bidirectional = bidirectional;

    if (bidirectional) {
      this.search = this.strategy(start, goal, expandNode, heuristics[heuristic], reverseHeuristics[heuristic]);
    } else {
      this.search = this.strategy(start, isGoal, expandNode, heuristics[heuristic]);
    }
  }

  stepSearch(steps) {
    if (!steps) {
      steps = this.yieldsPerStep;
    }

    if (this.search) {
      try {
        for (let i = 0; i < steps; ++i) {
          const nextIteration = this.search.next();
          if (nextIteration.done) {
            if (this.onStop) this.onStop();
            this.isSearching = false;
            break;
          } else {
            this.stateData = nextIteration.value;
            if (this.onStep) this.onStep(this.stateData);
            this.hasChangedSinceDraw = true;
          }
        }
      } catch (err) {
        swal(err.title, err.message, "error");
        if (this.onStop) this.onStop();
        this.isSearching = false;
        this.resetSearch();
      }
    }
  }

  startSearch() {
    this.isSearching = true;
  }

  pauseSearch() {
    this.isSearching = false;
  }

  resetSearch() {
    this.setSearchStrategy(this.strategy, this.heuristic, this.bidirectional);
    this.stateData = null;
    this.hasChangedSinceDraw = true;
  }

  setSpeed(speed) {
    if (speed < 0) {
      this.yieldsPerStep = -speed;
      speed = 0;
    } else {
      this.yieldsPerStep = 1;
    }
    this.stepSpeed = (speed === 0) ? 0 : speed/100;
  };

  update(dt) {
    if (this.isSearching) {
      if (this.timeToStep <= 0) {
        this.timeToStep = this.stepSpeed;
        this.stepSearch();
      }
      this.timeToStep -= dt;
    }
  }

  updateMaze(maze, width, height) {
    this.mazeData = maze;
    this.mazeWidth = width;
    this.mazeHeight = height;

    this.canvas.width = this.gridSize * width;
    this.canvas.height = this.gridSize * height;

    this.resetSearch();
    this.hasChangedSinceDraw = true;
  }

  getMaze() {
    return {
      maze: this.mazeData,
      width: this.mazeWidth,
      height: this.mazeHeight
    };
  }

  getImageBlob() {
    return dataUrlToBlob(this.canvas.toDataURL(), 'maze.png');
  }
  
  getImageDataUrl() {
    return this.canvas.toDataURL();
  }

  *gridIterator() {
    for (let y = 0; y !== this.mazeHeight; ++y) {
      for (let x = 0; x !== this.mazeWidth; ++x) {
        yield [x, y, y * this.mazeHeight + x];
      }
    }
  }

  draw() {
    if (this.hasChangedSinceDraw) {
      // Draw the maze
      let shade;
      let x, y, i;

      this.graphics.clearRect(0, 0, this.gridSize * this.mazeWidth, this.gridSize * this.mazeHeight);
      for ([x, y, i] of this.gridIterator()) {
        shade = this.mazeData[i];

        if (shade === START) {
          this.graphics.fillStyle = '#00bb00';
        } else if (shade === GOAL) {
          this.graphics.fillStyle = '#ee0000';
        } else {
          this.graphics.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
        }
        this.graphics.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
      }

      // Draw overlays
      if (this.stateData) {
        const openSet   = this.stateData.open || new Set();
        const closedSet = this.stateData.closed || new Set();
        const current   = this.stateData.current;
        const neighbours = this.stateData.neighbours || new Set();
        const path = new Set(this.stateData.path);
        const nodesA = this.stateData.nodesA;
        const nodesB = this.stateData.nodesB;

        for ([x, y, i] of this.gridIterator()) {
          if (neighbours.has(i)) {
            const {x: currX, y: currY} = this.fromIndex(current);
            const rectScale = 0.8;
            this.graphics.strokeStyle = 'rgb(150, 0, 150)';
            this.graphics.fillStyle = 'rgb(150, 0, 150)';
            this.graphics.lineWidth = 2;
            this.graphics.beginPath();
            this.graphics.arc(x * this.gridSize + this.gridSize/2, y * this.gridSize + this.gridSize/2, this.gridSize/2 * 0.75, 0, 2 * Math.PI, false);
            this.graphics.fill();
            this.graphics.beginPath();
            this.graphics.moveTo(currX * this.gridSize + this.gridSize/2, currY * this.gridSize + this.gridSize/2);
            this.graphics.lineTo(x * this.gridSize + this.gridSize/2, y * this.gridSize + this.gridSize/2);
            this.graphics.stroke();
          }
        }

        for ([x, y, i] of this.gridIterator()) {
          if (openSet.has(i)) {
            this.graphics.fillStyle = 'rgba(255, 0, 255, 0.5)';
            this.graphics.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
          } else if (closedSet.has(i)) {
            if (nodesA && nodesA.has(i)) {
              this.graphics.fillStyle = 'rgba(255, 127, 0, 0.3)';
            } else if (nodesB && nodesB.has(i)) {
              this.graphics.fillStyle = 'rgba(127, 96, 0, 0.3)';
            } else {
              this.graphics.fillStyle = 'rgba(255, 127, 0, 0.3)';
            }
            this.graphics.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
          }

          if (i === current) {
            this.graphics.fillStyle = 'rgb(0, 200, 127)';
            this.graphics.strokeStyle = 'rgba(0, 80, 50, 0.8)';
            this.graphics.lineWidth = 1;
            this.graphics.beginPath();
            this.graphics.arc(x * this.gridSize + this.gridSize/2, y * this.gridSize + this.gridSize/2, this.gridSize/2 * 0.8, 0, 2 * Math.PI, false);
            this.graphics.fill();
            this.graphics.stroke();
          } else if (path.has(i)) {
            if (this.stateData.action === 'found') {
              this.graphics.fillStyle = 'rgba(0, 200, 0, 0.8)';
            } else if (this.stateData.action === 'giveup') {
              this.graphics.fillStyle = 'rgba(255, 0, 0, 0.8)';
            } else {
              this.graphics.fillStyle = 'rgba(0, 0, 255, 0.8)';
            }
            this.graphics.beginPath();
            this.graphics.arc(x * this.gridSize + this.gridSize/2, y * this.gridSize + this.gridSize/2, this.gridSize/2 * 0.5, 0, 2 * Math.PI, false);
            this.graphics.fill();
          }
        }

        if (this.stateData.action === 'found') {
          this.graphics.strokeStyle = 'rgba(0, 200, 0, 0.8)';
        } else if (this.stateData.action === 'giveup') {
          this.graphics.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        } else {
          this.graphics.strokeStyle = 'rgba(0, 0, 255, 0.8)';
        }

        let prevX = null;
        let prevY = null;
        for (let node of Array.from(this.stateData.path)) {
          const {x: nodeX, y: nodeY} = this.fromIndex(node);
          if (prevX) {
            this.graphics.beginPath();
            this.graphics.lineWidth = 1;
            this.graphics.moveTo(nodeX * this.gridSize + this.gridSize/2, nodeY * this.gridSize + this.gridSize/2);
            this.graphics.lineTo(prevX * this.gridSize + this.gridSize/2, prevY * this.gridSize + this.gridSize/2);
            this.graphics.stroke();
          }

          prevX = nodeX;
          prevY = nodeY;
        }
      }
    }
    this.hasChangedSinceDraw = false;
  }
}
