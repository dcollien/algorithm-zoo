import React, { useState, ChangeEvent } from "react";
import { DrawnGraphNode } from "../../components/Graph/Graph";
import { ISearch } from "../../algorithms/DiscreteSearch/search";
import { searches } from "../../algorithms/DiscreteSearch/searchChoices";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";
import { GraphSearch } from "./GraphSearch";
import { css } from "emotion";
import { GraphNode } from "../../dataStructures/Graph";

export enum SearchStrategy {
  DFS_LEFT = "dfs-left",
  DFS_RIGHT = "dfs-right",
  DFS_RANDOM = "dfs-random",
  BFS = "bfs",
  UNIFORM_COST = "uniform-cost",
  BEST_FIRST = "best-first",
  A_STAR = "a-star"
}

interface IExampleGraph {
  start: DrawnGraphNode;
  graph: DrawnGraphNode[];
  goals: Set<DrawnGraphNode>;
  width: number;
  height: number;
  description?: React.ReactNode;
  heuristics?: {
    [key: string]: IExampleHeuristic;
  };
}

interface IExampleHeuristic {
  description?: React.ReactNode;
  func: (goal: GraphNode) => (node: GraphNode) => number;
}

interface ISearchDemoProps {
  searchStrategy: SearchStrategy;
  examples: { [key: string]: IExampleGraph };
}

const SEARCHES = {
  [SearchStrategy.DFS_RANDOM]: "Depth-First (Randomly Ordered Neighbours)",
  [SearchStrategy.DFS_LEFT]: "Depth-First (Reverse Ordered Neighbours)",
  [SearchStrategy.DFS_RIGHT]: "Depth-First",
  [SearchStrategy.BFS]: "Breadth-First",
  [SearchStrategy.UNIFORM_COST]: "Uniform Cost",
  [SearchStrategy.BEST_FIRST]: "Best-First",
  [SearchStrategy.A_STAR]: "A*"
};

const DFS_DESCRIPTION = (
  <>
    The neighbouring nodes are added to a <em>stack</em> where they are then
    visited in a "last in, first out" order.
  </>
);

const DESCRIPTIONS = {
  [SearchStrategy.DFS_RANDOM]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding any path {pathDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited in a random order.
      <br />
      {DFS_DESCRIPTION}
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.DFS_LEFT]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding any path {pathDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited left-to-right.
      <br />
      {DFS_DESCRIPTION}
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.DFS_RIGHT]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding any path {pathDesc} using Depth-First Search.
      <br />
      When a node is expanded, the edges are visited right-to-left.
      <br />
      {DFS_DESCRIPTION}
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.BFS]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding the path {pathDesc} with the fewest edges, using Breadth-First
      Search.
      <br />
      The neighbouring nodes are added to a <em>queue</em> where they are then
      visited in a "first in, first out" order.
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.UNIFORM_COST]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding the lowest-cost path {pathDesc} using using Uniform Cost Search.
      Search.
      <br />
      The neighbouring nodes are added to a <em>priority queue</em> where they
      are then visited in order of the lowest cost path to the starting node.
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.BEST_FIRST]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding any path {pathDesc} using Best-First Search (Greedy Search).
      Search.
      <br />
      The neighbouring nodes are added to a <em>priority queue</em> where they
      are then visited in an order determined by a heuristic.
      <br />
      {graphDesc}
      <hr />
    </>
  ),
  [SearchStrategy.A_STAR]: (
    pathDesc: React.ReactNode,
    graphDesc: React.ReactNode
  ) => (
    <>
      Finding the lowest-cost path {pathDesc} using using A* Search. Search.
      <br />
      When a node is expended, the neighbouring nodes are added to a{" "}
      <em>priority queue</em> where they are then visited in order, ranked by
      (lowest cost path to the starting node) + (a heuristic).
      <br />
      {graphDesc}
      <hr />
    </>
  )
};

const selectionCss = css`
  display: inline-block;
`;

export const SearchDemo: React.FC<ISearchDemoProps> = ({
  searchStrategy,
  examples
}) => {
  const firstExample = Object.keys(examples)[0];
  const [exampleGraph, setExampleGraph] = useState<IExampleGraph>(
    examples[firstExample]
  );
  const [start, setStart] = useState<DrawnGraphNode>(
    examples[firstExample].start
  );
  const [goal, setGoal] = useState<DrawnGraphNode>(
    examples[firstExample].goals.values().next().value
  );

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

  const pathDesc = (
    <>
      from{" "}
      <span className={selectionCss}>
        <select
          aria-label="Starting Node"
          value={start.label}
          onChange={handleStartChange}
        >
          {exampleGraph.graph.map(node => (
            <option key={node.label} value={node.label}>
              {node.label}
            </option>
          ))}
        </select>
      </span>{" "}
      to{" "}
      <span className={selectionCss}>
        <select
          aria-label="Goal Node"
          value={goal.label}
          onChange={handleGoalChange}
        >
          {exampleGraph.graph.map(node => (
            <option key={node.label} value={node.label}>
              {node.label}
            </option>
          ))}
        </select>
      </span>
    </>
  );

  const heuristic: IExampleHeuristic | undefined = exampleGraph.heuristics
    ? exampleGraph.heuristics[searchStrategy]
    : undefined;
  const graphDesc = (
    <>
      {exampleGraph.description}
      {heuristic ? (
        <>
          <br />
          {heuristic.description}
        </>
      ) : null}
    </>
  );
  const heuristicFunc = heuristic ? heuristic.func(goal): undefined;

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
        heuristic={heuristicFunc}
      >
        {DESCRIPTIONS[searchStrategy](pathDesc, graphDesc)}
      </GraphSearch>
    </div>
  );
};
