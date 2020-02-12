import React, { useState } from "react";
import { storiesOf } from "@storybook/react";

import { Graph, DrawnGraphNode } from "./Graph";

storiesOf("Graph", module).add("sample", () => {
  const [isRunning, setIsRunning] = useState(true);

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

  const graph: DrawnGraphNode[] = [a, b, c, d];

  const onUpdate = (dt: number) => {
    setIsRunning(false);
  };

  return <Graph width={1024} height={768} isAnimating={isRunning} graph={graph} onUpdate={onUpdate}/>;
});
