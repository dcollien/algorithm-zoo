import React from "react";
import { storiesOf } from "@storybook/react";

import { SearchDemo, SearchStrategy } from "./SearchDemos";

import { droneGraph } from "./droneGraph";
import { droneGraphCosts } from "./droneGraphCosts";
import { binaryTree } from "./binaryTree";

const UNINFORMED_EXAMPLES = {
  "Example 1: Graph Search": droneGraph,
  "Example 2: Tree Search": binaryTree
};

const INFORMED_EXAMPLES = {
  "Example 1: Graph Search": droneGraphCosts
};

storiesOf("Graph Search", module)
  .add("Depth-First Search (Randomly Chosen)", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_RANDOM}
      examples={UNINFORMED_EXAMPLES}
    />
  ))
  .add("Depth-First Search (Left First)", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_LEFT}
      examples={UNINFORMED_EXAMPLES}
    />
  ))
  .add("Depth-First Search (Right First)", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_RIGHT}
      examples={UNINFORMED_EXAMPLES}
    />
  ))
  .add("Breadth-First Search", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.BFS}
      examples={UNINFORMED_EXAMPLES}
    />
  ))
  .add("Best-First Search", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.BEST_FIRST}
      examples={INFORMED_EXAMPLES}
    />
  ))
  .add("Uniform-Cost Search", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.UNIFORM_COST}
      examples={INFORMED_EXAMPLES}
    />
  ))
  .add("A* Search", () => (
    <SearchDemo
      searchStrategy={SearchStrategy.A_STAR}
      examples={INFORMED_EXAMPLES}
    />
  ));
