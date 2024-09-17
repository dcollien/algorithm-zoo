import {Stack, Queue, PriorityQueue} from 'es-collections';

const shuffle = (a) => {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }
}

// Storage for common node data and methods
class NodeStore {
  constructor() {
    this.nodes = new Map();
  }

  set(node, data) {
    this.nodes.set(node, data);
  }

  g(node) {
    return (this.nodes.get(node) || {}).cost;
  }

  parent(node) {
    return this.nodes.get(node).parent;
  }

  has(node) {
    return this.nodes.has(node);
  }

  pathToRoot(node) {
    const path = new Stack();
    for (let current = node; current !== null; current = this.parent(current)) {
        path.push(current);
    }
    return path;
  }
}

// Different data structures to implement the open set
// Wraps a PQueue, a Stack, or a Queue to give the same interface
class OpenSet {
  constructor(ordering) {
    this.insertion = 0;

    if (!ordering) {
      // default to priority queue
      ordering = 'pqueue';
    }

    const compare = (a, b) => {
      if (a.rank === b.rank) {
        return a.insertion - b.insertion;
      } else {
        return a.rank - b.rank;
      }
    };

    const collection = {
      'stack': new Stack(),
      'queue': new Queue(),
      'pqueue': new PriorityQueue(compare)
    }[ordering.toLowerCase()];
    this.collection = collection;

    this._add = () => { throw "Not Implemented: add"; };
    this._remove = () => { throw "Not Implemented: remove"; };
    this._delete = () => { throw "Not Implemented: delete"; };

    if (collection instanceof PriorityQueue) {
      this._add = (node) => collection.add(node);
      this._remove = () => collection.remove();
      this._delete = (node) => collection.delete(node);
    } else if (collection instanceof Queue) {
      this._add = (node) => collection.enqueue(node);
      this._remove = () => collection.dequeue();
    } else if (collection instanceof Stack) {
      this._add = (node) => collection.push(node);
      this._remove = () => collection.pop();
    }

    this.nodes = new Map();
  }

  add(node, rank=null) {
    const nodeObject = {node, rank, insertion: this.insertion};
    this._add(nodeObject);
    this.nodes.set(node, nodeObject);
    this.insertion++;
  }

  delete(node) {
    const nodeObject = this.nodes.get(node);
    this.nodes.delete(node);
    this._delete(nodeObject);
  }

  remove() {
    let nodeObject = this._remove();
    if (nodeObject) {
      this.nodes.delete(nodeObject.node);
    }
    return nodeObject.node;
  }

  has(node) {
    return this.nodes.has(node);
  }

  get size() {
    return this.nodes.size;
  }

  [Symbol.iterator]() {
    return this.collection;
  }
}


const algos = {
  *depthFirst(start, isGoal, expandNode) {
    // Search using a stack
    const collection = 'stack';
    const randomize = true; // randomize neighbours
    yield *algos.search(start, isGoal, expandNode, {collection, randomize});
  },

  *breadthFirst(start, isGoal, expandNode) {
    // Search using a queue
    const collection = 'queue';
    yield *algos.search(start, isGoal, expandNode, {collection});
  },

  *costDirected(start, isGoal, expandNode) {
    // prioritise by just minimising the cost
    const useCost = true;
    yield *algos.search(start, isGoal, expandNode, {useCost});
  },

  *greedy(start, isGoal, expandNode, heuristic) {
    // prioritise by just minimising a heuristic
    const useCost = false;
    yield *algos.search(start, isGoal, expandNode, {useCost, heuristic});
  },

  *aStar(start, isGoal, expandNode, heuristic) {
    // prioritise by minimising the sum of the cost + heuristic
    const useCost = true;
    yield *algos.search(start, isGoal, expandNode, {useCost, heuristic});
  },

  *search(start, isGoal, expandNode, options={}) {
    // Node storage
    const nodes = new NodeStore();

    // For determining the rank of a node
    const useCost = options.useCost;
    const heuristic = options.heuristic || null;

    // Collection of nodes ready to be expanded
    const open = new OpenSet(options.collection);

    // Set of nodes already explored
    const closed = new Set();

    // Set up "start" as the current node
    const startProperties = {
      parent: null, // end of the line, no parent to the start
      cost: 0
    };

    nodes.set(start, startProperties);
    let current = start;

    // Runtime data output
    const show = (action, neighbours=null) => {
      const neighbourSet = new Set();

      if (neighbours !== null) {
        for (let nodeData of neighbours) {
          neighbourSet.add(nodeData.node);
        }
      }

      return {
        action,
        current,
        open,
        closed,
        neighbours: neighbourSet,
        path: nodes.pathToRoot(current),
        cost: nodes.g(current)
      };
    };

    // Add the starting node to the heap of nodes to be expanded
    open.add(current, 0);

    while (!isGoal(current)) {
      if (open.size === 0) {
        // No path to goal, exit
        yield show('giveup');
        return;
      }

      // Show the caller that this is a loop iteration
      yield show('loop');

      // remove the lowest ranked node from "open"
      current = open.remove();

      // add current to closed
      closed.add(current);

      // expand current
      const neighbours = expandNode(current);

      if (options.randomize) {
        shuffle(neighbours);
      }

      yield show('expanded', neighbours);
      for (let nodeData of neighbours) {
        const neighbour = nodeData.node;
        const movementCost = nodeData.weight;

        let neighbourInOpen = open.has(neighbour);
        let neighbourInClosed = closed.has(neighbour);

        const nodeProperties = {
          parent: current
        };

        let rank = 0;

        // cost-to-start of this neighbour is the
        // cost of the current node + the cost of movement to the neighbour
        const cost = nodes.g(current) + movementCost;
        nodeProperties.cost = cost;

        if (useCost) {
          if (neighbourInOpen && cost < nodes.g(neighbour)) {
            // remove old neighbor from "open", because new path is better
            open.delete(neighbour);
            neighbourInOpen = false;
          }

          if (neighbourInClosed && cost < nodes.g(neighbour)) {
            // similarly, remove old neighbour from "closed"
            closed.delete(neighbour);
            neighbourInClosed = false;
          }
          rank += cost;
        }

        if (heuristic !== null) {
          rank += heuristic(neighbour);
        }

        if (!neighbourInOpen && !neighbourInClosed) {
          nodes.set(neighbour, nodeProperties)
          open.add(neighbour, rank);
        }
      };
    }

    // Show the caller that the goal has been found, exit
    yield show('found');
  },

  *biCostDirected(a, b, expandNode) {
    // prioritise by just minimising the cost
    const useCost = true;
    yield *algos.biSearch(a, b, expandNode, {useCost});
  },

  *biAStar(a, b, expandNode, heuristicA, heuristicB) {
    // prioritise by minimising the sum of the cost + heuristic
    const useCost = true;
    yield *algos.biSearch(a, b, expandNode, {useCost, heuristicA, heuristicB});
  },

  *biSearch(a, b, expandNode, options={}) {
    // Node storage
    const nodesA = new NodeStore();
    const nodesB = new NodeStore();

    // For determining the rank of a node
    const useCost = options.useCost;
    nodesA.heuristic = options.heuristicA || null;
    nodesB.heuristic = options.heuristicB || null;

    // Collection of nodes ready to be expanded
    const open = new OpenSet(options.collection);

    // Set of nodes already explored
    const closed = new Set();

    // Set up "start" as the current node
    const startProperties = {
      cost: 0,
      parent: null
    };
    const endProperties = {
      cost: 0,
      parent: null
    };

    nodesA.set(a, startProperties);
    nodesB.set(b, startProperties);

    let current = a;
    let fringe = 'a';

    // Runtime data output
    const show = (action, neighbours=null) => {
      const neighbourSet = new Set();

      if (neighbours !== null) {
        for (let nodeData of neighbours) {
          neighbourSet.add(nodeData.node);
        }
      }

      const costA = nodesA.g(current) || 0;
      const costB = nodesB.g(current) || 0;

      let finalPath, which;
      if (nodesA.has(current) && nodesB.has(current)) {
        const firstHalf  = Array.from(nodesA.pathToRoot(current));
        const secondHalf = Array.from(nodesB.pathToRoot(current));
        finalPath = [...firstHalf, ...secondHalf.reverse()];
      } else if (nodesA.has(current)){
        finalPath = nodesA.pathToRoot(current);
      } else if (nodesB.has(current)) {
        finalPath = nodesB.pathToRoot(current);
      }

      return {
        action,
        current,
        open,
        closed,
        neighbours: neighbourSet,
        path: finalPath,
        cost: costA + costB,
        nodesA,
        nodesB
      };
    };

    let nodes, otherSide;

    // Add the starting node to the heap of nodes to be expanded
    open.add(a, 0);
    open.add(b, 0);

    while (true) {
      if (open.size === 0) {
        // No path to goal, exit
        yield show('giveup');
        return;
      }

      // Show the caller that this is a loop iteration
      yield show('loop');

      // remove the lowest ranked node from "open"
      current = open.remove();

      // which nodes collection to use
      nodes = nodesA.has(current) ? nodesA : nodesB;
      otherSide = nodesA.has(current) ? nodesB : nodesA;

      if (otherSide.has(current)) {
        yield show('found');
        return;
      }

      // add current to closed
      closed.add(current);

      // expand current
      const neighbours = expandNode(current);
      yield show('expanded', neighbours);
      for (let nodeData of neighbours) {
        const neighbour = nodeData.node;
        const movementCost = nodeData.weight;

        let neighbourInOpen = open.has(neighbour);
        let neighbourInClosed = closed.has(neighbour);

        const nodeProperties = {
          parent: current
        };

        let rank = 0;

        // cost-to-start of this neighbour is the
        // cost of the current node + the cost of movement to the neighbour
        const cost = nodes.g(current) + movementCost;
        nodeProperties.cost = cost;

        if (useCost) {
          if (neighbourInOpen && cost < nodes.g(neighbour)) {
            // remove old neighbor from "open", because new path is better
            open.delete(neighbour);
            neighbourInOpen = false;
          }

          if (neighbourInClosed && cost < nodes.g(neighbour)) {
            // similarly, remove old neighbour from "closed"
            closed.delete(neighbour);
            neighbourInClosed = false;
          }
          rank += cost;
        }

        if (nodes.heuristic !== null) {
          rank += nodes.heuristic(neighbour);
        }

        if (!neighbourInOpen && !neighbourInClosed) {
          nodes.set(neighbour, nodeProperties)
          open.add(neighbour, rank);
        } else if (!nodes.has(neighbour)){
          nodes.set(neighbour, nodeProperties);
        }
      };
    }
  },

  *iterativeDeepening(start, isGoal, expandNode) {
    let nodes;
    const closed = new Set();
    const show = (action, node, neighbours=null) => {
      const neighbourSet = new Set();

      if (neighbours !== null) {
        for (let nodeData of neighbours) {
          neighbourSet.add(nodeData.node);
        }
      }

      return {
        action,
        current: node,
        open: new Set(nodes.nodes.keys()),
        closed: closed,
        neighbours: neighbourSet,
        path: nodes.pathToRoot(node),
        cost: nodes.g(node)
      };
    };

    const opts = {
      show,
      expandNode,
      isGoal,
      closed
    };

    let bound = 1;
    while (true) {
      nodes = new NodeStore();
      nodes.set(start, { parent: null, cost: 0 });
      opts.nodes = nodes;
      const visited = new Set();
      const result = {};
      yield *algos.depthLimited(start, bound, visited, opts, result);
      if (result.goal) {
        yield show('found', result.node);
        return;
      }
      if (result.noGoal) {
        yield show('giveup', result.node);
        return;
      }

      bound++;
    }
  },

  *depthLimited(node, bound, visited, opts, returnVal) {
    yield opts.show('loop', node);

    if (bound === 0) {
      returnVal.goal = false;
      returnVal.node = node;
      return;
    } else if (opts.isGoal(node)) {
      returnVal.goal = true;
      returnVal.node = node;
      return;
    }

    visited.add(node);
    const neighbours = opts.expandNode(node);

    yield opts.show('expanded', node, neighbours);

    let numSkipped = 0;
    for (let nodeData of neighbours) {
      if (visited.has(nodeData.node)) {
        numSkipped++;
        continue;
      };

      opts.nodes.set(nodeData.node, {
        parent: node,
        cost: opts.nodes.g(node) + nodeData.weight
      });
      opts.closed.add(nodeData.node);

      const result = {};
      yield *algos.depthLimited(nodeData.node, bound-1, visited, opts, result);
      if (result.goal) {
        returnVal.goal = true;
        returnVal.node = result.node;
        return;
      } else if (result.noGoal) {
        numSkipped++;
      }
    }

    visited.delete(node);

    if (numSkipped === neighbours.length) {
      returnVal.noGoal = true;
    }

    returnVal.goal = false;
    returnVal.node = node;
    return;
  },

  *IDAstar(start, isGoal, expandNode, heuristic) {
    let nodes;
    const closed = new Set();
    const show = (action, node, neighbours=null) => {
      const neighbourSet = new Set();

      if (neighbours !== null) {
        for (let nodeData of neighbours) {
          neighbourSet.add(nodeData.node);
        }
      }

      return {
        action,
        current: node,
        open: new Set(nodes.nodes.keys()),
        closed: closed,
        neighbours: neighbourSet,
        path: nodes.pathToRoot(node),
        cost: nodes.g(node)
      };
    };

    const opts = {
      show,
      heuristic: heuristic,
      expandNode,
      isGoal,
      closed
    };

    let bound = heuristic(start);
    while (true) {
      nodes = new NodeStore();
      nodes.set(start, { parent: null, cost: 0 });
      opts.nodes = nodes;

      const visited = new Set();
      const result = {};
      yield *algos.recursiveSearch(start, 0, bound, visited, opts, result);
      if (result.goal) {
        yield show('found', result.node);
        return;
      }
      if (result.rank === Number.POSITIVE_INFINITY) {
        yield show('giveup', result.node);
        return;
      }
      bound = result.rank;
    }
  },

  *recursiveSearch(node, cost, bound, visited, opts, returnVal) {
    const rank = cost + opts.heuristic(node);

    yield opts.show('loop', node);

    if (rank > bound) {
      returnVal.goal = false;
      returnVal.node = node;
      returnVal.rank = rank;
      return;
    }

    if (opts.isGoal(node)) {
      returnVal.goal = true;
      returnVal.node = node;
      return;
    }

    let minResult = {
      node: null,
      rank: Number.POSITIVE_INFINITY
    };

    visited.add(node);

    const neighbours = opts.expandNode(node);
    yield opts.show('expanded', node, neighbours);

    for (let nodeData of neighbours) {
      if (visited.has(nodeData.node)) {
        continue; // already visited
      }

      // keep track of path
      opts.nodes.set(nodeData.node, {
        parent: node,
        cost: cost + nodeData.weight
      });
      opts.closed.add(nodeData.node);

      const result = {};
      yield *algos.recursiveSearch(
        nodeData.node,
        cost + nodeData.weight,
        bound,
        visited,
        opts,
        result
      );

      if (result.goal) {
        returnVal.goal = result.goal;
        returnVal.node = result.node;
        return;
      } else if (result.rank < minResult.rank) {
        minResult = result;
      }
    }

    visited.delete(node);

    returnVal.goal = false;
    returnVal.node = minResult.node;
    returnVal.rank = minResult.rank;
    return;
  }


};

export default algos;
