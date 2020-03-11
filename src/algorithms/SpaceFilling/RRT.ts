import { VectLike, v } from "../../utils/vector";
import { M } from "../../utils/math";

type ExtendFunc<Q> = (from: Q, to: Q) => [Q | null, boolean];

export interface IRRTOptions<Q> {
  // Generate a random configuration
  random: () => Q;

  // Extend from a node, returning [node, isGoal]
  // A node of null indicates no connection to the destination
  extend: ExtendFunc<Q>;

  // Distance from one node to another
  distance: (from: Q, to: Q) => number;

  // Iterations before giving up
  maxIterations: number;
}

export class RRT<Q> {
  start: Q;
  options: IRRTOptions<Q>;

  constructor(start: Q, options: IRRTOptions<Q>) {
    this.start = start;
    this.options = options;
  }

  generatePlan() {
    const nodes = [this.start];
    const edges = new Map<Q, Q[]>();

    for (let i = 0; i < this.options.maxIterations; i++) {
      const randomNode = this.options.random();
      const nearestNode = this.getNearestNode(nodes, randomNode);
      const [newNode, isGoal] = this.options.extend(nearestNode, nearestNode);

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

  getNearestNode(nodes: Q[], node: Q) {
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

export const extendLine = (
  imageData: ImageData,
  goal: VectLike,
  goalRadius: number
): ExtendFunc<VectLike> => (from, to) => {
  return [to, false];
};

export const euclideanDist = (from: VectLike, to: VectLike) => v.dist(from, to);

export const randomPoint = (width: number, height: number) => () =>
  v(M.randInt(width), M.randInt(height));
