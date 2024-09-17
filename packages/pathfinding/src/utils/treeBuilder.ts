import { DrawnGraph, DrawnGraphNode } from "../components/Graph/Graph";

const alphabet = "abcdefghijklmnopqrstuvwxyz";

export const buildTree = (
  depth: number,
  branching: number,
  rowHeight: number,
  width: number
): DrawnGraph => {
  const graph: DrawnGraphNode[] = [];

  let nodeIndex = 0;

  for (let layer = 0; layer < depth; layer++) {
    const numNodes = Math.pow(branching, layer);
    const offsetX = width / numNodes;

    for (let i = 0; i < numNodes; i++) {
      const label = new Array(Math.floor(nodeIndex / alphabet.length) + 1).fill(
        alphabet[nodeIndex % alphabet.length].toUpperCase()
      ).join('');
      const node: DrawnGraphNode = {
        x: offsetX * i + offsetX / 2,
        y: rowHeight * layer + rowHeight / 2,
        label,
        edges: []
      };

      const parentIndex = Math.ceil(nodeIndex / branching) - 1;

      if (parentIndex >= 0) {
        const parent = graph[parentIndex];
        parent.edges?.push({
          destination: node
        });
      }

      graph.push(node);
      nodeIndex++;
    }
  }

  return graph;
};
