import { ISearch, search, Status } from "./search";
import { StackNodeSet } from "./nodeSets";
import { GraphNode } from "../../dataStructures/Graph";

function shuffleArray<T>(array: Array<T>) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

const flowchart = {
  mermaid: `
    graph TD;

    start("Start");
    initOpenSet["Create a 'stack' of graph nodes.<br/>Push 'start node' onto the 'stack'"];
    initCurrentNode["Set 'current node' to 'start node'"];
    isEmpty{{"Is the 'stack' empty?"}};
    isGoal{{"Is the 'current node' the goal?"}};
    takeFromOpenSet["Pop the top node off the 'stack'<br/>Set 'current node' to this value."];
    expand["Expand the 'current node' into a 'set of neighbours'"];
    neighbours["Push each node in the 'set of neighbours'<br/> onto the top of the 'stack',<br/>skipping any nodes which have already been opened."];
    noPath("No path found.");
    goal("Path to goal found.");

    start-->initOpenSet;
    initOpenSet-->initCurrentNode;
    initCurrentNode-->isGoal;
    isGoal-- Yes -->goal;
    isGoal-- No -->isEmpty;
    isEmpty-- Yes -->noPath;
    isEmpty-- No -->takeFromOpenSet;
    takeFromOpenSet-->expand;
    expand-->neighbours;
    neighbours-->isGoal;
  `,
  steps: new Set([
    Status.Start,
    Status.InitOpenSet,
    Status.InitCurrentNode,
    Status.IsGoal,
    Status.IsEmpty,
    Status.TakeFromOpenSet,
    Status.Expand,
    Status.Neighbours,
    Status.NoPath,
    Status.Goal
  ]),
  decisions: {
    [Status.IsGoal]: {
      "Yes": 3,
      "No": 4
    },
    [Status.IsEmpty]: {
      "Yes": 5,
      "No": 6
    }
  }
};

export const DepthFirstSearchRandom: ISearch = {
  flowchart,
  *search(start, isGoal) {
    const stack = new StackNodeSet();

    // randomly order the expanded nodes
    const expandNode = (node: GraphNode) => {
      const edges = [...node.edges] || [];
      shuffleArray(edges);
      return edges;
    };
    yield* search(start, stack, isGoal, expandNode);
  }
};

export const DepthFirstSearchReversed: ISearch = {
  flowchart,
  *search(start, isGoal) {
    const stack = new StackNodeSet();
        // randomly order the expanded nodes
        const expandNode = (node: GraphNode) => {
          const edges = [...node.edges] || [];
          return edges.reverse();
        };
    yield* search(start, stack, isGoal, expandNode);
  }
};

export const DepthFirstSearch: ISearch = {
  flowchart,
  *search(start, isGoal) {
    const stack = new StackNodeSet();
    yield* search(start, stack, isGoal);
  }
};
