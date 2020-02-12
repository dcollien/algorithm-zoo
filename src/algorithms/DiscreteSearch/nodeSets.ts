import { FibonacciHeap, INode } from '@tyriar/fibonacci-heap';
import { GraphNode } from '../../dataStructures/Graph';

export interface NodeSet {
  isEmpty(): boolean;
  insert: (node: GraphNode, rank?: number) => void;
  remove: () => GraphNode;
  decreaseRankTo?: (node: GraphNode, rank: number) => void;
}

export class PriorityNodeSet implements NodeSet {
  heap: FibonacciHeap<number, GraphNode>;
  nodes: Map<GraphNode, INode<number, GraphNode>>;

  constructor() {
    this.heap = new FibonacciHeap<number, GraphNode>();
    this.nodes = new Map<GraphNode, INode<number, GraphNode>>();
  }

  insert(node: GraphNode, rank=1) {
    this.nodes.set(node, this.heap.insert(rank, node));
  }

  remove() {
    const node = this.heap.extractMinimum();
    if (node === null || node.value === undefined) {
      throw new Error("No value to remove.");
    }
    this.nodes.delete(node.value);
    return node.value;
  }

  isEmpty() {
    return this.heap.isEmpty();
  }

  decreaseRankTo(node: GraphNode, rank: number) {
    const heapNode = this.nodes.get(node);
    if (heapNode === undefined || heapNode.value !== node) {
      throw new Error("Invalid node");
    }
    this.heap.decreaseKey(heapNode, rank);
  }
}

export class StackNodeSet implements NodeSet {
  stack: Array<GraphNode>;

  constructor() {
    this.stack = new Array<GraphNode>();
  }

  insert(node: GraphNode) {
    this.stack.push(node);
  }

  remove() {
    const node = this.stack.pop();
    if (node === undefined) {
      throw new Error("No value to remove.");
    }
    return node;
  }

  isEmpty() {
    return this.stack.length === 0;
  }
}

export class QueueNodeSet implements NodeSet {
  queue: Array<GraphNode>;

  constructor() {
    this.queue = new Array<GraphNode>();
  }

  insert(node: GraphNode) {
    this.queue.push(node);
  }

  remove() {
    const node = this.queue.shift();
    if (node === undefined) {
      throw new Error("No value to remove.");
    }
    return node;
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}
