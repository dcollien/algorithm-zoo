import { DrawnGraphNode } from "../../components/Graph/Graph";
import { Edge } from "../../dataStructures/Graph";

/* WIP
const graphDefinition = `
A(50, 50)
B(100, 100)

A<--10-->B
`;

const parseGraph = (graphDefinition: string) => {
  const nodes: DrawnGraphNode[] = [];
  const edges: [DrawnGraphNode, Edge][] = [];
  const lines = graphDefinition.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed) {
      const match = trimmed.match(/^[A-Za-z ]+/);
      if (match === null) {
        throw new Error(`Parse error on line ${i+1}. Unable to read node label.`);
      }

      const label = match[0].trim();
      const info = trimmed.slice(label.length);
      if (info.startsWith('<--')) {
        const weight = Number.parseInt(info.match(/^\<--\w*(\d)+\w*--\>$/));

      }
    }
  });
};
*/

/*
const graph: DrawnGraphNode[] = [a];

const goals = new Set([a]);

export const romanianGraph = {
  start: a,
  graph,
  goals
};
*/