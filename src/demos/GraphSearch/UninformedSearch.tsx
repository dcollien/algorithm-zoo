import React, { useState, ChangeEvent } from "react";
import { DrawnGraphNode } from "../../components/Graph/Graph";
import { droneGraph } from "./droneGraph";
import { binaryTree } from "./binaryTree";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { searches } from "../../algorithms/DiscreteSearch/searchChoices";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";
import { GraphSearch } from "./GraphSearch";
import { css } from "emotion";

export enum SearchStrategy {
  DFS_LEFT = "dfs-left",
  DFS_RIGHT = "dfs-right",
  DFS_RANDOM = "dfs-random",
  BFS = "bfs"
}

interface IExampleGraph {
  start: DrawnGraphNode;
  graph: DrawnGraphNode[];
  goals: Set<DrawnGraphNode>;
  width: number;
  height: number;
}

interface IUninformedSearchProps {
  searchStrategy: SearchStrategy;
}

const SEARCHES = {
  [SearchStrategy.DFS_RANDOM]: "Depth-First (Randomly Ordered Neighbours)",
  [SearchStrategy.DFS_LEFT]: "Depth-First (Reverse Ordered Neighbours)",
  [SearchStrategy.DFS_RIGHT]: "Depth-First",
  [SearchStrategy.BFS]: "Breadth-First"
};

const DFS_DESCRIPTION = (
  <>
    The neighbouring nodes are added to a <em>stack</em> where they are then
    visited in a "last in, first out" order.
  </>
);

const DESCRIPTIONS = {
  [SearchStrategy.DFS_RANDOM]: (graphDesc: React.ReactNode) => (
    <>
      Finding any path {graphDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited in a random order.
      <br />
      {DFS_DESCRIPTION}
      <hr />
    </>
  ),
  [SearchStrategy.DFS_LEFT]: (graphDesc: React.ReactNode) => (
    <>
      Finding any path {graphDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited left-to-right.
      <br />
      {DFS_DESCRIPTION}
      <hr />
    </>
  ),
  [SearchStrategy.DFS_RIGHT]: (graphDesc: React.ReactNode) => (
    <>
      Finding any path {graphDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited right-to-left.
      <br />
      {DFS_DESCRIPTION}
      <hr />
    </>
  ),
  [SearchStrategy.BFS]: (graphDesc: React.ReactNode) => (
    <>
      Finding the path {graphDesc} with the fewest edges, using Breadth-First
      Search.
      <br />
      The neighbouring nodes are added to a <em>queue</em> where they are then
      visited in a "first in, first out" order.
      <hr />
    </>
  )
};

const selectionCss = css`
  display: inline-block;
`;

export const UninformedSearch: React.FC<IUninformedSearchProps> = ({
  searchStrategy
}) => {
  const [exampleGraph, setExampleGraph] = useState<IExampleGraph>(droneGraph);
  const [start, setStart] = useState<DrawnGraphNode>(droneGraph.start);
  const [goal, setGoal] = useState<DrawnGraphNode>(
    droneGraph.goals.values().next().value
  );

  const examples: {
    [key: string]: IExampleGraph;
  } = {
    "Example 1: Graph Search": droneGraph,
    "Example 2: Tree Search": binaryTree
  };

  const handleExampleChange = (example: string) => {
    const exampleGraph = examples[example];
    setExampleGraph(exampleGraph);
    setStart(exampleGraph.start);
    setGoal(exampleGraph.goals.values().next().value);
  };

  const handleStartChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const label = event.target.value;
    const node = exampleGraph.graph.filter(node => node.label === label)[0];
    setStart(node);
  };

  const handleGoalChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const label = event.target.value;
    const node = exampleGraph.graph.filter(node => node.label === label)[0];
    setGoal(node);
  };

  const searchKey = SEARCHES[searchStrategy] as keyof typeof searches;
  const search: ISearch = searches[searchKey];

  const graphDesc = (
    <>
      from{" "}
      <span className={selectionCss}>
        <select aria-label="Starting Node" value={start.label} onChange={handleStartChange}>
          {exampleGraph.graph.map(node => (
            <option key={node.label} value={node.label}>
              {node.label}
            </option>
          ))}
        </select>
      </span>
      {" "} to <span className={selectionCss}>
        <select aria-label="Goal Node" value={goal.label} onChange={handleGoalChange}>
          {exampleGraph.graph.map(node => (
            <option key={node.label} value={node.label}>
              {node.label}
            </option>
          ))}
        </select>
      </span>
    </>
  );

  return (
    <div>
      <div>
        Select from one of the following examples:
        <br />
        <SimpleSelector
          examples={Object.keys(examples)}
          onSelect={handleExampleChange}
        />
        <hr />
      </div>
      <GraphSearch
        search={search}
        graph={exampleGraph.graph}
        start={start}
        goals={new Set([goal])}
        width={exampleGraph.width}
        height={exampleGraph.height}
      >
        {DESCRIPTIONS[searchStrategy](graphDesc)}
      </GraphSearch>
    </div>
  );
};
