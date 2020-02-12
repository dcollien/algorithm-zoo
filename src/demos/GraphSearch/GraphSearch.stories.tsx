import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { searches } from "../../algorithms/DiscreteSearch/searchChoices";

import { GraphSearch } from "./GraphSearch";
import { DrawnGraphNode } from "../../components/Graph/Graph";
import { ISearch } from "../../algorithms/DiscreteSearch/search";

storiesOf("Graph Search", module).add("sample", () => {
  const a: DrawnGraphNode = {
    x: 64,
    y: 64,
    fill: "white",
    stroke: "black",
    radius: 16,
    edges: []
  };

  const b: DrawnGraphNode = {
    x: 64,
    y: 64 * 2,
    fill: "blue",
    stroke: "black",
    radius: 16,
    edges: []
  };

  const c: DrawnGraphNode = {
    x: 64,
    y: 64 * 3,
    fill: "white",
    stroke: "black",
    radius: 16,
    edges: []
  };

  const d: DrawnGraphNode = {
    x: 64 * 3,
    y: 64 * 2 - 16,
    fill: "white",
    stroke: "black",
    radius: 16,
    edges: []
  };

  a.edges = [
    {
      weight: 1,
      width: 2,
      stroke: "black",
      destination: b
    }
  ];
  b.edges = [
    {
      weight: 1,
      width: 2,
      stroke: "black",
      destination: c
    },
    {
      weight: 1,
      width: 2,
      stroke: "black",
      destination: d
    }
  ];
  c.edges = [];
  d.edges = [];

  const search: ISearch = searches["Depth-First"];

  const graph: DrawnGraphNode[] = [a, b, c, d];

  const goals = new Set([d]);

  return <GraphSearch search={search} graph={graph} start={a} goals={goals} />;
});
