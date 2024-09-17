import Maze from './maze.js';
import searchTypes from './searchAlgos.js';
import mazeTypes from './mazeGen.js';
import searchCode from './searchCode.js';

import { compressUrlData, decompressUrlData } from './data.js';
import { sendMessage, getParent } from './messaging.js';

const size = 79;
let currentMaze = null;
let isRunning = false;
let playHTML = null;
let pauseHTML = '<span class="fi-pause"></span>';
let currentTool = 'small';
let currentColor = 'color-empty';
let isDragging = false;

const relMouseCoords = (currentElement, event) => {
  var totalOffsetX = 0;
  var totalOffsetY = 0;
  var canvasX = 0;
  var canvasY = 0;

  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while (currentElement = currentElement.offsetParent);

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  return { x: canvasX, y: canvasY }
}

const onToolChange = () => {
  const largeTool = document.getElementById('tool-large');
  const smallTool = document.getElementById('tool-small');
  if (currentTool === 'small') {
    smallTool.dataset.active = 'true';
    largeTool.dataset.active = 'false';
  } else if (currentTool === 'large') {
    smallTool.dataset.active = 'false';
    largeTool.dataset.active = 'true';
  }

  const colors = document.getElementsByClassName('color');
  [].forEach.call(colors, (color) => {
    if (color.id === currentColor) {
      color.dataset.active = 'true';
    } else {
      color.dataset.active = 'false';
    }
  });
};

const init = (appId, appSetup, exhibit, isSetupMode) => {
  const display = document.getElementById('display');
  display.style.display = '';

  const canvas = document.getElementById('maze-canvas');
  const mazeSelection = document.getElementById('maze-select');
  const algoSelection = document.getElementById('algorithm-select');

  playHTML = document.getElementById('run-button').innerHTML;

  const mazeList = [
    {
      name: 'Tree Maze',
      type: 'path',
      weighted: false,
      graph: false
    },
    {
      name: 'Graph Maze',
      type: 'path',
      weighted: false,
      graph: true
    },
    {
      name: 'Weighted Graph Maze',
      type: 'path',
      weighted: true,
      graph: true
    },
    {
      name: 'Concentric Tree Maze',
      type: 'circle',
      weighted: false,
      graph: false
    },
    {
      name: 'Concentric Graph Maze',
      type: 'circle',
      weighted: false,
      graph: true
    },
    {
      name: 'Weighted Concentric Graph Maze',
      type: 'circle',
      weighted: true,
      graph: true
    },
    {
      name: 'Alternating Squares',
      type: 'alternating'
    },
    {
      name: 'Empty',
      type: 'empty'
    }
  ];

  const algorithmList = [
    {
      id: 'dfs',
      name: 'Depth-First',
      description: 'Prioritises expanding the most recently expanded nodes. (N.B. Expanded neighbours are added in a random order.)',
      search: searchTypes.depthFirst,
      code: searchCode.depthFirst
    },
    {
      id: 'bfs',
      name: 'Breadth-First',
      description: 'Prioritises expanding the closest nodes to the root.',
      search: searchTypes.breadthFirst,
      code: searchCode.breadthFirst
    },
    {
      id: 'ids',
      name: 'Iterative Deepening',
      description: 'Combines depth-first search\'s space-efficiency and breadth-first search\'s completeness. Performs multiple iterations of depth-first search of increasing depth. N.B. In this visualisation, "Open" denotes nodes explored by the current iteration, and "Closed" denotes nodes explored on the previous iteration.',
      search: searchTypes.iterativeDeepening,
      code: searchCode.iterativeDeepening
    },
    {
      id: 'cds',
      name: 'Cost-Directed',
      description: 'Prioritises expanding nodes with the lowest total cost to the root.',
      search: searchTypes.costDirected,
      code: searchCode.costDirected
    },
    {
      id: 'gsman',
      name: 'Greedy - Manhatten distance heuristic',
      description: 'Prioritises expanding nodes which best optimise a heuristic.',
      search: searchTypes.greedy,
      code: searchCode.greedy,
      heuristic: 'manhatten'
    },
    {
      id: 'gseuc',
      name: 'Greedy - Euclidean distance heuristic',
      description: 'Prioritises expanding nodes which best optimise a heuristic.',
      search: searchTypes.greedy,
      code: searchCode.greedy,
      heuristic: 'euclid'
    },
    {
      id: 'astarman',
      name: 'A* - Manhatten distance heuristic',
      description: 'Prioritises expanding nodes which best optimise both a heuristic and the total cost to the root.',
      search: searchTypes.aStar,
      code: searchCode.aStar,
      heuristic: 'manhatten'
    },
    {
      id: 'astareuc',
      name: 'A* - Euclidean distance heuristic',
      description: 'Prioritises expanding nodes which best optimise both a heuristic and the total cost to the root.',
      search: searchTypes.aStar,
      code: searchCode.aStar,
      heuristic: 'euclid'
    },
    {
      id: 'idastarman',
      name: 'Iterative-Deepening A* - Manhatten distance heuristic',
      description: 'Performs a depth-first search, cutting off a branch when its total cost (based on both cost to the root and a heuristic) exceeds a threshold, with the threshold increasing each iteration. N.B. In this visualisation, "Open" denotes nodes explored by the current iteration, and "Closed" denotes nodes explored on the previous iteration.',
      search: searchTypes.IDAstar,
      code: searchCode.IDAstar,
      heuristic: 'manhatten'
    },
    {
      id: 'idastareuc',
      name: 'Iterative-Deepening A* - Euclidean distance heuristic',
      description: 'Performs a depth-first search, cutting off a branch when its total cost (based on both cost to the root and a heuristic) exceeds a threshold, with the threshold increasing each iteration. N.B. In this visualisation, "Open" denotes nodes explored by the current iteration, and "Closed" denotes nodes explored on the previous iteration.',
      search: searchTypes.IDAstar,
      code: searchCode.IDAstar,
      heuristic: 'euclid'
    },
    {
      id: 'bicost',
      name: 'Bi-Directional Cost-Directed Search',
      description: 'Performs cost-directed searches from both the start and the goal towards each other.',
      search: searchTypes.biCostDirected,
      code: searchCode.biCostDirected,
      bidirectional: true
    },
    {
      id: 'biastarman',
      name: 'Bi-Directional A* - Manhatten distance heuristic',
      description: 'Performs A* searches from both the start and the goal towards each other.',
      search: searchTypes.biAStar,
      code: searchCode.biAStar,
      heuristic: 'manhatten',
      bidirectional: true
    },
    {
      id: 'biastareuc',
      name: 'Bi-Directional A* - Euclidean distance heuristic',
      description: 'Performs A* searches from both the start and the goal towards each other.',
      search: searchTypes.biAStar,
      code: searchCode.biAStar,
      heuristic: 'euclid',
      bidirectional: true
    }
  ];

  mazeList.forEach((item, index) => {
    const option = document.createElement('option');
    option.appendChild(document.createTextNode(item.name));
    option.value = index;
    mazeSelection.appendChild(option);
  });

  algorithmList.forEach((item, index) => {
    const option = document.createElement('option');
    option.appendChild(document.createTextNode(item.name));
    option.value = index;
    option.id = item.id;
    algoSelection.appendChild(option);
  });

  let mazeRenderer = null;

  const onStop = () => {
    document.getElementById('run-button').innerHTML = playHTML;
    isRunning = false;
  }

  const onStep = (stateData) => {
    if (typeof stateData.cost === 'number') {
      document.getElementById('path-cost').innerText = stateData.cost;
      document.getElementById('path-cost-display').style.display = '';
    } else {
      document.getElementById('path-cost-display').style.display = 'none';
    }
  }

  const onStart = () => {
    document.getElementById('run-button').innerHTML = pauseHTML;
    isRunning = true;
  }

  const generateMaze = (maze) => {
    const mazeDefn = mazeList[mazeSelection.value];
    const algo = algorithmList[algoSelection.value];

    if (!maze) {
      currentMaze = mazeTypes[mazeDefn.type](size, size, mazeDefn.graph, mazeDefn.weighted);
    } else {
      currentMaze = maze;
    }

    if (!mazeRenderer) {
      mazeRenderer = new Maze(canvas, currentMaze, size, size, 8, onStop, onStep);
      mazeRenderer.setSearchStrategy(algo.search, algo.heuristic || 'manhatten', algo.bidirectional);
      mazeRenderer.run();
    } else {
      mazeRenderer.updateMaze(currentMaze, size, size);
    }
  };

  algoSelection.onchange = () => {
    const algo = algorithmList[algoSelection.value];
    document.getElementById('notes').innerText = algo.description;
    document.getElementById('code').innerText = algo.code;
    if (mazeRenderer) {
      mazeRenderer.setSearchStrategy(algo.search, algo.heuristic || 'manhatten', algo.bidirectional);
    }

  };
  algoSelection.onchange();

  document.getElementById('generate-button').onclick = () => {
    generateMaze();
  };
  document.getElementById('step-button').onclick = () => {
    if (mazeRenderer) {
      mazeRenderer.stepSearch(1);
    }
  };
  document.getElementById('run-button').onclick = () => {
    if (mazeRenderer) {
      if (isRunning) {
        mazeRenderer.pauseSearch();
        onStop();
      } else {
        mazeRenderer.startSearch();
        onStart();
      }
    }
  };
  document.getElementById('reset-button').onclick = () => {
    if (mazeRenderer) {
      mazeRenderer.resetSearch();
    }
  };

  const speedChange = () => {
    if (mazeRenderer) {
      mazeRenderer.setSpeed(parseInt(document.getElementById('speed').value, 10));
    }
  };
  document.getElementById('speed').onchange = speedChange;
  document.getElementById('speed').onclick = speedChange;

  document.getElementById('tool-small').onclick = () => {
    if (currentTool === 'small') {
      currentTool = null;
    } else {
      currentTool = 'small';
    }
    onToolChange();
  };
  document.getElementById('tool-large').onclick = () => {
    if (currentTool === 'large') {
      currentTool = null;
    } else {
      currentTool = 'large';
    }
    onToolChange();
  };

  const selectColor = (event) => {
    currentColor = event.target.id;
    onToolChange();
  }
  document.getElementById('color-select').onclick = selectColor;
  window.addEventListener("keydown", (event) => {
    const keyCode = ('which' in event) ? event.which : event.keyCode;
    const index = keyCode - 49;
    const colorSelections = [
      'color-empty',
      'color-weight1',
      'color-weight2',
      'color-weight3',
      'color-weight4',
      'color-weight5',
      'color-wall',
      'color-goal',
      'color-start'
    ];

    if (index >= 0 && index < colorSelections.length) {
      currentColor = colorSelections[index];
    } else if (index === -1) {
      if (currentTool === 'small') {
        currentTool = 'large';
      } else if (currentTool === 'large') {
        currentTool = 'small';
      }
    }
    onToolChange();
  });

  const draw = (event) => {
    const colors = {
      'color-goal': -2,
      'color-start': -1,
      'color-empty': 255,
      'color-wall': 0,
      'color-weight1': 224,
      'color-weight2': 192,
      'color-weight3': 160,
      'color-weight4': 128,
      'color-weight5': 96
    };
    const { x, y } = relMouseCoords(canvas, event);
    if (mazeRenderer) {
      mazeRenderer.drawTool(currentTool, colors[currentColor], x, y);
    }
  };

  canvas.onclick = draw;
  canvas.onmousedown = () => {
    isDragging = true;
  };
  window.onmouseup = () => {
    isDragging = false;
  };
  canvas.onmousemove = (event) => {
    if (isDragging) {
      draw(event);
    }
  }

  generateMaze();
  onToolChange();

  if (exhibit) {
    // Hide the chooser if this is a gallery exhibit
    document.getElementById('maze-environment-chooser').style.display = 'none';
    generateMaze(exhibit.maze);
    document.getElementById('share-button').style.display = 'none';

    if (!document.location.search.endsWith('&tab')) {
      const links = document.getElementById('externalLinks');
      links.style.display = '';
      links.innerHTML = `<a href="${document.location.href}&tab" target="_blank">Open in new tab</a>`;
    }
  } else if (isSetupMode) {
    const setupContainer = document.getElementById('setup');
    const algos = {};
    setupContainer.style.display = 'block';
    document.getElementById('display').style.display = 'none';

    algorithmList.forEach((algo) => {
      setupContainer.innerHTML += `
<div>
<label><input type="checkbox" value="${algo.id}" id="check-${algo.id}" checked /> ${algo.name}</label>
</div>`
        ;

      algos[algo.id] = true;
    });

    if (appSetup && appSetup.hiddenAlgos) {
      appSetup.hiddenAlgos.forEach((algoId) => {
        const element = document.getElementById(`check-${algoId}`);
        element.checked = false;
        algos[element.value] = false;
      });
    }

    sendMessage({
      action: "set",
      name: '_artefactName',
      value: "maze",
      id: appId
    });

    algorithmList.forEach((algo) => {
      document.getElementById(`check-${algo.id}`).onclick = (event) => {
        const element = event.currentTarget;
        algos[element.value] = element.checked

        const hiddenAlgos = Object.keys(algos).filter((key) => !algos[key]);

        sendMessage({
          action: "set",
          name: 'hiddenAlgos',
          value: hiddenAlgos,
          id: appId
        });
      };
    });
  } else {
    // Activate the share button
    document.getElementById('share-button').onclick = () => {
      const postData = mazeRenderer.getMaze();
      const thumbnail = mazeRenderer.getImageDataUrl();
      postData.setup = appSetup;

      document.getElementById('share-button').dataset.loading = 'true';

      compressUrlData(postData).then((encodedData) => {
        const url = window.location.href.split('?')[0] + '?' + encodedData;

        const attachment = {
          action: "share",
          attachments: [{
            url,
            title: "Maze",
            contentType: "text/html",
            height: 960,
          }],
          thumbnail,
          id: appId
        }

        sendMessage(attachment);
      });

      document.getElementById('share-button').dataset.loading = 'false';
    };
  }

  // Only display algorithms we need
  if (appSetup && appSetup.hiddenAlgos) {
    appSetup.hiddenAlgos.forEach((algoId) => {
      algoSelection.removeChild(document.getElementById(algoId));
    });
  }
  algoSelection.onchange();

  const resize = () => {
    sendMessage({
      action: "resize",
      height: document.documentElement.offsetHeight,
      id: appId
    });
  };

  window.addEventListener('resize', resize);
  resize();
};

const queryString = window.location.search.substring(1).split('&')[0];
const isSetupMode = queryString === 'setup';
let isInited = false;

if (!isSetupMode && queryString) {
  decompressUrlData(queryString).then((queryData) => {
    init('exhibit', queryData.setup, queryData);
  });
} else {
  window.addEventListener('message', (event) => {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

    if (data.action === 'init' && !isInited) {
      isInited = true;
      init(data.id, data.setup, null, isSetupMode);
    }
  });

  window.addEventListener('load', () => {
    if (!isInited) {
      setTimeout(() => {
        if (!isInited) {
          console.warn("Initialisation timed out. Running in standalone mode.");
          console.info("This app is designed to run in an iframe or window launched from the learning environment. It will not function correctly in standalone mode.");
          init('test', null, null, isSetupMode);
        }
      }, 1000);
    }
  });
}
