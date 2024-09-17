import {buildTree} from "../../utils/treeBuilder";
import { DrawnGraphNode } from "../../components/Graph/Graph";

const tree = buildTree(5, 2, 64+32, 640);

export const binaryTree = {
  start: tree[0],
  graph: tree,
  goals: new Set<DrawnGraphNode>([tree[25]]),
  width: 640,
  height: 520
};
