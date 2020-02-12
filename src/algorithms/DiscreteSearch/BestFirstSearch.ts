import { ISearch, search } from "./search";
import { PriorityNodeSet } from "./nodeSets";
import { GraphNode } from "../../dataStructures/Graph";

export const BestFirstSearch: ISearch = {
  *search(start, isGoal, heuristic) {
    const prioritySet = new PriorityNodeSet();

    if (!heuristic) {
      throw new Error("Best First Search requires a heuristic");
    }

    const calculateRank = (node: GraphNode, _pathCost: number) => heuristic(node);
    yield* search(start, prioritySet, isGoal, undefined, calculateRank);
  }
};
