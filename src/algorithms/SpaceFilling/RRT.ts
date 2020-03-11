export type ExtendFunc<Q, R extends Q = Q> = (from: Q, to: R) => [Q | null, boolean];

export interface IRRTOptions<Q, R extends Q = Q> {
  // Generate a random configuration
  random: () => R;

  // Extend from a node, returning [node, isGoal]
  // A node of null indicates no connection to the destination
  extend: ExtendFunc<Q, R>;

  // Distance from one node to another
  distance: (from: Q, to: R) => number;

  // Iterations before giving up
  maxIterations: number;
}

export class RRT<Q, R extends Q = Q> {
  start: Q;
  options: IRRTOptions<Q, R>;

  constructor(start: Q, options: IRRTOptions<Q, R>) {
    this.start = start;
    this.options = options;
  }

  generatePlan() {
    const nodes = [this.start];
    const edges = new Map<Q, Q[]>();

    for (let i = 0; i < this.options.maxIterations; i++) {
      const randomNode = this.options.random();
      const nearestNode = this.getNearestNode(nodes, randomNode);
      const [newNode, isGoal] = this.options.extend(nearestNode, randomNode);

      if (newNode !== null) {
        // Add newNode to tree
        nodes.push(newNode);

        // Add edge to tree
        const nodeEdges = edges.get(nearestNode);
        const newNodeEdges = nodeEdges || [];
        newNodeEdges.push(newNode);
        edges.set(nearestNode, newNodeEdges);
      }

      if (isGoal) {
        break;
      }
    }

    return edges;
  }

  getNearestNode(nodes: Q[], node: R) {
    const distances = nodes.map((treeNode: Q): [number, Q] => [
      this.options.distance(treeNode, node),
      node
    ]);

    let nearest = distances[0];
    for (let i = 0; i < distances.length; i++) {
      const candidate = distances[i];
      nearest = candidate[0] < nearest[0] ? candidate : nearest;
    }

    return nearest[1];
  }
}
