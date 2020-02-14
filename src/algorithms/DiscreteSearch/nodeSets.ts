import { FibonacciHeap, INode } from "@tyriar/fibonacci-heap";
import { GraphNode } from "../../dataStructures/Graph";

export interface IMember {
  value: GraphNode;
  rank?: number;
}

export enum DataType {
  Stack = "stack",
  Queue = "queue",
  PriorityQueue = "pqueue"
}

export interface NodeSet {
  dataType: DataType,
  isEmpty(): boolean;
  insert: (node: GraphNode, rank?: number) => void;
  remove: () => GraphNode;
  decreaseRankTo?: (node: GraphNode, rank: number) => void;
  members: () => IMember[];
}

export class PriorityNodeSet implements NodeSet {
  dataType = DataType.PriorityQueue;
  heap: FibonacciHeap<number, GraphNode>;
  nodes: Map<GraphNode, INode<number, GraphNode>>;

  constructor() {
    this.heap = new FibonacciHeap<number, GraphNode>();
    this.nodes = new Map<GraphNode, INode<number, GraphNode>>();
  }

  insert(node: GraphNode, rank = 1) {
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

  members() {
    const memberArray = new Array<IMember>();
    for (const [graphNode, heapNode] of this.nodes.entries()) {
      memberArray.push({
        value: graphNode,
        rank: heapNode.key
      });
    }
    return memberArray;
  }
}

export class StackNodeSet implements NodeSet {
  dataType = DataType.Stack;
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

  members() {
    return this.stack.map(node => ({ value: node }));
  }
}

export class QueueNodeSet implements NodeSet {
  dataType = DataType.Queue;
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

  members() {
    return this.queue.map(node => ({ value: node }));
  }
}
