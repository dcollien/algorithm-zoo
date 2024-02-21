export interface Edge {
  weight?: number;
  destination: GraphNode;
}

export interface GraphNode {
  x: number;
  y: number;
  edges?: Edge[];
}

export type Graph = GraphNode[];
