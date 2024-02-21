import { GraphNode } from "../../dataStructures/Graph";

export const euclidean = (goal: GraphNode) => (node: GraphNode) => {
  const a = goal.x - node.x;
  const b = goal.y - node.y;
  return Math.sqrt(a*a + b*b);
}
