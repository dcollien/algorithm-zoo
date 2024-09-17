import React from "react";

import { SearchDemo, SearchStrategy } from "./SearchDemo";

import { droneGraph } from "./droneGraph";
import { droneGraphCosts } from "./droneGraphCosts";
import { binaryTree } from "./binaryTree";
import { directedGraph } from "./directedGraph";

const UNINFORMED_EXAMPLES = {
  "Example 1: Bidirected Graph": droneGraph,
  "Example 2: Binary Tree": binaryTree
};

const INFORMED_EXAMPLES = {
  "Example 1: Directed Graph": droneGraphCosts,
  "Example 2: Directed Graph": directedGraph
};

const demos = {
  "dfs-random": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_RANDOM}
      examples={UNINFORMED_EXAMPLES}
    />
  ),
  "dfs-left": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_LEFT}
      examples={UNINFORMED_EXAMPLES}
    />
  ),
  "dfs-right": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.DFS_RIGHT}
      examples={UNINFORMED_EXAMPLES}
    />
  ),
  bfs: () => (
    <SearchDemo
      searchStrategy={SearchStrategy.BFS}
      examples={UNINFORMED_EXAMPLES}
    />
  ),
  "best-first-search": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.BEST_FIRST}
      examples={INFORMED_EXAMPLES}
    />
  ),
  "uniform-cost-search": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.UNIFORM_COST}
      examples={INFORMED_EXAMPLES}
    />
  ),
  "a-star-search": () => (
    <SearchDemo
      searchStrategy={SearchStrategy.A_STAR}
      examples={INFORMED_EXAMPLES}
    />
  )
};

const isDemo = (demo: string): demo is keyof typeof demos => demo in demos;

const Demos: React.FC<{ demo: string }> = (props) => {
  return <>{isDemo(props.demo) && demos[props.demo]()}</>;
}

export default Demos;
