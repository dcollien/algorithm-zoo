import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { searches } from "../../algorithms/DiscreteSearch/searchChoices";

import { GraphSearch } from "./GraphSearch";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { droneGraph } from "./droneGraph";

storiesOf("Graph Search", module).add("sample", () => {
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
});
