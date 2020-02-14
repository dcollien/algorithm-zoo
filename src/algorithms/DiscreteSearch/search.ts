import { GraphNode, Edge } from "../../dataStructures/Graph";
import { NodeSet } from "./nodeSets";

interface Path {
  cost: number;
  previous: GraphNode;
}

export enum Status {
  Start = "start",
  InitOpenSet = "initOpenSet",
  InitCurrentNode = "initCurrentNode",
  IsGoal = "isGoal",
  IsEmpty = "isEmpty",
  TakeFromOpenSet = "takeFromOpenSet",
  Expand = "expand",
  Neighbours = "neighbours",
  NoPath = "noPath",
  BetterNeighbour = "betterNeighbour",
  SkipNeighbour = "skipNeighbour",
  NewNeighbour = "newNeighbour",
  Goal = "goal"
}

function getPathNodes(destination: GraphNode, paths: Map<GraphNode, Path>) {
  const nodes: GraphNode[] = [];
  let current = destination;

  while (paths.has(current)) {
    nodes.unshift(current);
    current = paths.get(current)!.previous;
  }
  nodes.unshift(current);

  return nodes;
}

export interface SearchStepResult {
  status: Status;
  currentNode: GraphNode | null;
  openSet: NodeSet | null;
  closedSet?: Set<GraphNode>;
  getBestPath: () => GraphNode[];
  neighbours?: Edge[];
  currentNeighbour?: GraphNode;
  choice?: boolean;
}

export const startResult = {
  status: Status.Start,
  currentNode: null,
  openSet: null,
  getBestPath: () => []
};

export function* search(
  start: GraphNode,
  openSet: NodeSet,
  isGoal: (node: GraphNode) => boolean,
  expandNode?: (node: GraphNode) => Edge[],
  calculateRank?: (node: GraphNode, pathCost: number) => number
): Generator<SearchStepResult> {
  const paths = new Map<GraphNode, Path>();
  const closedSet = new Set<GraphNode>();

  const stepResult = (
    status: Status,
    {
      neighbours,
      choice,
      currentNeighbour
    }: { neighbours?: Edge[]; choice?: boolean; currentNeighbour?: GraphNode }
  ) => ({
    status,
    currentNode: current,
    openSet,
    closedSet,
    getBestPath,
    neighbours,
    choice,
    currentNeighbour
  });

  const getBestPath = () => getPathNodes(current, paths);

  openSet.insert(start, 0);
  yield stepResult(Status.InitOpenSet, {});

  let current = start;
  yield stepResult(Status.InitCurrentNode, {});

  while (!openSet.isEmpty()) {
    yield stepResult(Status.IsEmpty, { choice: false });

    if (isGoal(current)) {
      yield stepResult(Status.IsGoal, { choice: true });
      yield stepResult(Status.Goal, {});
      return;
    }
    yield stepResult(Status.IsGoal, { choice: false });

    current = openSet.remove();
    closedSet.add(current);
    yield stepResult(Status.TakeFromOpenSet, {});

    const currentPath = paths.get(current);
    const neighbours = expandNode ? expandNode(current) : current.edges || [];
    yield stepResult(Status.Expand, { neighbours });

    for (let edge of neighbours) {
      const neighbour = edge.destination;
      const edgeCost = edge.weight !== undefined ? edge.weight : 1;
      const pathCost = (currentPath?.cost || 0) + edgeCost;
      const rank = calculateRank
        ? calculateRank(neighbour, pathCost)
        : pathCost;

      const existingPathToNeighbour = paths.get(neighbour);

      if (existingPathToNeighbour !== undefined) {
        // another path to this neighbour was previously opened
        if (openSet.decreaseRankTo && pathCost < existingPathToNeighbour.cost) {
          // update the path, as this set supports decreasing ranks,
          // and the new path has a lower cost
          existingPathToNeighbour.cost = pathCost;
          existingPathToNeighbour.previous = current;
          // change the rank in the queue (if supported)
          openSet.decreaseRankTo(neighbour, rank);

          yield stepResult(Status.BetterNeighbour, {
            neighbours,
            currentNeighbour: neighbour
          });
        } else {
          // otherwise skip this neighbour and
          // use the other path
          yield stepResult(Status.SkipNeighbour, {
            neighbours,
            currentNeighbour: neighbour
          });
        }
      } else {
        // no existing path to this neighbour, add it to the open set
        openSet.insert(neighbour, rank);
        paths.set(neighbour, {
          cost: pathCost,
          previous: current
        });

        yield stepResult(Status.NewNeighbour, {
          neighbours,
          currentNeighbour: neighbour
        });
      }
    }
    yield stepResult(Status.Neighbours, { neighbours });
  }

  yield stepResult(Status.NoPath, {});
}

export interface ISearch {
  flowchart?: {
    mermaid: string,
    steps: Set<Status>,
    decisions: {
      [key in Status]?: {
        [key: string]: number
      }
    }
  },
  search(
    start: GraphNode,
    isGoal: (node: GraphNode) => boolean,
    heuristic?: (node: GraphNode) => number
  ): Generator<SearchStepResult>;
}