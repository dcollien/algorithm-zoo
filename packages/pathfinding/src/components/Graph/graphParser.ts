import { DrawnGraphNode } from "./Graph";

export const parseGraph = (graphDefinition: string) => {
  const nodes: DrawnGraphNode[] = [];
  const edges: [string, string, number, boolean][] = [];
  const nodeTable: { [key: string]: DrawnGraphNode } = {};
  const lines = graphDefinition.split("\n");
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed) {
      const match = trimmed.match(/^[A-Za-z ]+/);
      if (match === null) {
        throw new Error(
          `Parse error on line ${i + 1}. Unable to read node label.`
        );
      }

      const label = match[0].trim();
      const info = trimmed.slice(label.length);
      if (info.startsWith("<--") || info.startsWith("--")) {
        const arrow = info.match(
          /^(?<biDirectional><)?(--)?\s*(?<weight>\d+)?\s*(--)?>\s*(?<destination>[A-Za-z]+)$/
        );
        if (arrow === null) {
          throw new Error(`Parse error on line ${i + 1}. Unable to read arrow`);
        }

        const { biDirectional, weight, destination } = arrow.groups as {
          biDirectional: string;
          weight: string;
          destination: string;
        };
        const hasWeight = Boolean(weight);
        const weightVal = hasWeight ? Number.parseInt(weight) : 1;
        if (!destination) {
          throw new Error(
            `Parse error on line ${i + 1}. Unable to read edge destination`
          );
        }

        if (biDirectional) {
          edges.push([label, destination, weightVal, hasWeight]);
          edges.push([destination, label, weightVal, false]);
        } else {
          edges.push([label, destination, weightVal, hasWeight]);
        }
      } else if (info.startsWith("(")) {
        const coord = info.match(/^\(\s*(?<x>\d*)\s*,\s*(?<y>\d*)\)$/);

        if (coord === null) {
          throw new Error(
            `Parse error on line ${i + 1}. Unable to read coordinates`
          );
        }
        const { x, y } = coord.groups as { x: string; y: string };
        const node = {
          label,
          x: Number.parseInt(x),
          y: Number.parseInt(y),
          edges: []
        };

        nodes.push(node);
        nodeTable[label] = node;
      }
    }
  });

  edges.forEach(([source, destination, weight, isLabelled]) => {
    const node = nodeTable[source];
    const destinationNode = nodeTable[destination];

    if (node && destinationNode) {
      node.edges?.push({
        destination: destinationNode,
        weight: weight,
        label: isLabelled ? weight.toString() : undefined
      });
    }
  });

  return nodes;
};
