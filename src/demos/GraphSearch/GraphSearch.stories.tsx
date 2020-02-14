import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { searches } from "../../algorithms/DiscreteSearch/searchChoices";

import { GraphSearch } from "./GraphSearch";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { droneGraph } from "./droneGraph";
import { droneGraphCosts } from "./droneGraphCosts";

storiesOf("Graph Search", module)
  .add("Depth-First Search (Randomly Chosen)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Depth-First (Randomly Ordered Neighbours)"];

    return (
      <GraphSearch
        search={search}
        graph={graph}
        start={start}
        goals={goals}
        width={480}
        height={540}
      />
    );
  })
  .add("Depth-First Search (Left First)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Depth-First (Reverse Ordered Neighbours)"];

    return (
      <GraphSearch
        search={search}
        graph={graph}
        start={start}
        goals={goals}
        width={480}
        height={540}
      />
    );
  })
  .add("Depth-First Search (Right First)", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Depth-First"];

    return (
      <GraphSearch
        search={search}
        graph={graph}
        start={start}
        goals={goals}
        width={480}
        height={540}
      />
    );
  })
  .add("Breadth-First Search", () => {
    const { start, graph, goals } = droneGraph;
    const search: ISearch = searches["Breadth-First"];

    return (
      <GraphSearch
        search={search}
        graph={graph}
        start={start}
        goals={goals}
        width={480}
        height={540}
      />
    );
  })
  .add("Uniform-Cost Search", () => {
    const { start, graph, goals } = droneGraphCosts;
    const search: ISearch = searches["Uniform Cost"];

    return (
      <GraphSearch
        search={search}
        graph={graph}
        start={start}
        goals={goals}
        width={480}
        height={540}
      />
    );
  });
