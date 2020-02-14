import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { searches } from "../../algorithms/DiscreteSearch/searchChoices";

import { GraphSearch } from "./GraphSearch";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { droneGraph } from "./droneGraph";
import { droneGraphCosts } from "./droneGraphCosts";
import { euclidean } from "../../algorithms/DiscreteSearch/heuristics";
import { GraphNode } from "../../dataStructures/Graph";

storiesOf("Graph Search", module)
  .add("Depth-First Search (Randomly Chosen)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch =
      searches["Depth-First (Randomly Ordered Neighbours)"];

    return (
      <div>
        Finding a path from A to K using Depth-First Search. 
        When a node is expanded, the edges are visited in a random order.
        The neighbouring nodes are added to a <em>stack</em> where they are then visited in a "first in, first out" order.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
      </div>
    );
  })
  .add("Depth-First Search (Left First)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch =
      searches["Depth-First (Reverse Ordered Neighbours)"];

    return (
      <div>
        Finding a path from A to K using Depth-First Search.
        When a node is expanded, the edges are visited left-to-right.
        The neighbouring nodes are added to a <em>stack</em> where they are then visited in a "first in, first out" order.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
      </div>
    );
  })
  .add("Depth-First Search (Right First)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Depth-First"];

    return (
      <div>
        Finding a path from A to K using Depth-First Search.
        When a node is expanded, the edges are visited right-to-left.
        The neighbouring nodes are added to a <em>stack</em> where they are then visited in a "first in, first out" order.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
      </div>
    );
  })
  .add("Breadth-First Search", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Breadth-First"];

    return (
      <div>
        Finding the path from A to K with the fewest edges, using Breadth-First Search.
        The neighbouring nodes are added to a <em>queue</em> where they are then visited in a "last in, first out" order.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
      </div>
    );
  })
  .add("Uniform-Cost Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Uniform Cost"];

    return (
      <div>
        Finding the lowest-cost path from A to K using Uniform Cost Search.
        The neighbouring nodes are added to a <em>priority queue</em> where they are then visited in order of the lowest cost path to the starting node.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
      </div>
    );
  })
  .add("Best-First Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Best-First"];
    const goal: GraphNode = goals.values().next().value;

    return (
      <div>
        Finding a from A to K using Best-First Search.
        The neighbouring nodes are added to a <em>priority queue</em> where they are then visited in an order determined by a heuristic.
        In this case the heuristic is the euclidean distance (in pixels) from K. This instructs the search to visit the nodes in the order of the geometrically closest to K first.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
          heuristic={euclidean(goal)}
        />
      </div>
    );
  })
  .add("Uniform-Cost Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Uniform Cost"];

    return (
      <div>
        Finding the lowest-cost path from A to K using Uniform Cost Search.
        The neighbouring nodes are added to a <em>priority queue</em> where they are then visited in order of the lowest cost path to the starting node.
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
        />
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
        Finding a from A to K using A* Search.
        The neighbouring nodes are added to a <em>priority queue</em> where they are then visited in an order of the (lowest cost path to the starting node) + (a heuristic).
        In this case the heuristic is the euclidean distance (in pixels) from K, divided by 150. 
        The edge C to E has the largest distance to edge weight ratio, and the distance of this edge (of weight 1) is under 150 pixels.
        Dividing by 150 will therefore ensure that the heuristic value will not dominate the edge costs. 
        Such a heuristic is said to be "admissible", resulting in the search always finding the shortest cost path. 
        <hr/>
        <GraphSearch
          search={search}
          graph={graph}
          start={start}
          goals={goals}
          width={480}
          height={540}
          heuristic={heuristic}
        />
      </div>
    );
  });