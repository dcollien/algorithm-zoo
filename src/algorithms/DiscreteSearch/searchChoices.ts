import { DepthFirstSearch } from "./DepthFirstSearch";
import { BreadthFirstSearch } from "./BreadthFirstSearch";
import { UniformCostSearch } from "./UniformCostSearch";
import { BestFirstSearch } from "./BestFirstSearch";
import { AStarSearch } from "./AStarSearch";

export const searches = {
  "Depth-First": DepthFirstSearch,
  "Breadth-First": BreadthFirstSearch,
  "Iterative Deepening": null,
  "Uniform Cost": UniformCostSearch,
  "Best-First": BestFirstSearch,
  "A*": AStarSearch,
};
