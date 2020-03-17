import React from "react";
import { storiesOf } from "@storybook/react";

import Demos from "./AllSearchDemos";


storiesOf("Graph Search", module)
  .add("Depth-First Search (Randomly Chosen)", () => (
    <Demos demo="dfs-random"/>
  ))
  .add("Depth-First Search (Left First)", () => (
    <Demos demo="dfs-left"/>
  ))
  .add("Depth-First Search (Right First)", () => (
    <Demos demo="dfs-right"/>
  ))
  .add("Breadth-First Search", () => (
    <Demos demo="bfs"/>
  ))
  .add("Best-First Search", () => (
    <Demos demo="best-first-search"/>
  ))
  .add("Uniform-Cost Search", () => (
    <Demos demo="uniform-cost-search"/>
  ))
  .add("A* Search", () => (
    <Demos demo="a-star-search"/>
  ));
