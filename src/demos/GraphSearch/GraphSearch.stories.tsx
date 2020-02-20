import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { searches } from "../../algorithms/DiscreteSearch/searchChoices";

import { GraphSearch } from "./GraphSearch";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { droneGraphCosts } from "./droneGraphCosts";
import { euclidean } from "../../algorithms/DiscreteSearch/heuristics";
import { GraphNode } from "../../dataStructures/Graph";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";

import { DrawnGraphNode } from "../../components/Graph/Graph";

import { droneGraph } from "./droneGraph";
import { binaryTree } from "./binaryTree";
import { UninformedSearch, SearchStrategy } from "./UninformedSearch";

interface IExampleGraph {
  start: DrawnGraphNode;
  graph: DrawnGraphNode[];
  goals: Set<DrawnGraphNode>;
  width: number;
  height: number;
  description: React.ReactNode;
}

storiesOf("Graph Search", module)
  .add("Depth-First Search (Randomly Chosen)", () => (
    <UninformedSearch searchStrategy={SearchStrategy.DFS_RANDOM} />
  ))
  .add("Depth-First Search (Left First)", () => (
    <UninformedSearch searchStrategy={SearchStrategy.DFS_LEFT} />
  ))
  .add("Depth-First Search (Right First)", () => (
    <UninformedSearch searchStrategy={SearchStrategy.DFS_RIGHT} />
  ))
  .add("Breadth-First Search", () => (
    <UninformedSearch searchStrategy={SearchStrategy.BFS} />
  ))
  .add("Uniform-Cost Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Uniform Cost"];

    return (
      <div>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        >
          Finding the lowest-cost path from A to K using Uniform Cost Search.
          <br />
          The neighbouring nodes are added to a <em>priority queue</em> where
          they are then visited in order of the lowest cost path to the starting
          node.
          <hr />
        </GraphSearch>
      </div>
    );
  })
  .add("Best-First Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Best-First"];
    const goal: GraphNode = goals.values().next().value;

    return (
      <div>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
          heuristic={euclidean(goal)}
        >
          Finding any path from A to K using Best-First Search.
          <br />
          The neighbouring nodes are added to a <em>priority queue</em> where
          they are then visited in an order determined by a heuristic.
          <br />
          In this case the heuristic is the euclidean distance (in pixels) from
          K. This instructs the search to visit the nodes in the order of the
          geometrically closest to K first.
          <hr />
        </GraphSearch>
      </div>
    );
  })
  .add("Uniform-Cost Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Uniform Cost"];

    return (
      <div>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        >
          Finding the lowest-cost path from A to K using Uniform Cost Search.
          <br />
          The neighbouring nodes are added to a <em>priority queue</em> where
          they are then visited in order of the lowest cost path to the starting
          node.
          <hr />
        </GraphSearch>
      </div>
    );
  })
  .add("A* Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["A*"];
    const goal: GraphNode = goals.values().next().value;
    const distToGoal = euclidean(goal);
    const heuristic = (node: GraphNode) => distToGoal(node) / 150;

    return (
      <div>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
          heuristic={heuristic}
        >
          Finding the shortest path from A to K using A* Search.
          <br />
          When a node is expended, the neighbouring nodes are added to a{" "}
          <em>priority queue</em> where they are then visited in order, ranked
          by (lowest cost path to the starting node) + (a heuristic).
          <br />
          In this case the heuristic is the euclidean distance (in pixels) from
          K, divided by 150. The edge C to E has the largest distance to edge
          weight ratio, and the distance of this edge (of weight 1) is under 150
          pixels. Dividing by 150 will therefore ensure that the heuristic value
          will not dominate the edge costs. Such a heuristic is said to be
          "admissible", resulting in the search always finding the shortest cost
          path.
          <hr />
        </GraphSearch>
      </div>
    );
  });
