import { DepthFirstSearch, DepthFirstSearchReversed, DepthFirstSearchRandom } from "./DepthFirstSearch";
import { BreadthFirstSearch } from "./BreadthFirstSearch";
import { UniformCostSearch } from "./UniformCostSearch";
import { BestFirstSearch } from "./BestFirstSearch";
import { AStarSearch } from "./AStarSearch";

export const searches = {
  "Depth-First": DepthFirstSearch,
  "Depth-First (Randomly Ordered Neighbours)": DepthFirstSearchRandom,
  "Depth-First (Reverse Ordered Neighbours)": DepthFirstSearchReversed,
  "Breadth-First": BreadthFirstSearch,
  //"Iterative Deepening": null,
  "Uniform Cost": UniformCostSearch,
  "Best-First": BestFirstSearch,
  "A*": AStarSearch,
};
