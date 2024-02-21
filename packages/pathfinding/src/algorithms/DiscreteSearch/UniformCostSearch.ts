import { ISearch, search, Status } from "./search";
import { PriorityNodeSet } from "./nodeSets";


const flowchart = {
  mermaid: `
    graph TD;

    start("Start");
    initOpenSet["Create a 'priority queue' of graph nodes.<br/>Push 'start node' onto the 'priority queue'"];
    initCurrentNode["Set 'current node' to 'start node' with a cost of 0"];
    isEmpty{{"Is the 'priority queue' empty?"}};
    isGoal{{"Is the 'current node' the goal?"}};
    takeFromOpenSet["Remove the lowest ranked node<br/>from the 'priority queue'.<br/>Set 'current node' to this value."];
    expand["Expand the 'current node'.<br/>Each neighbour's cost =<br/> (cost of 'current node') + (edge weight)"];
    neighbours["Add any new neighbouring nodes<br/> to the 'priority queue', ranked by cost.<br/>Update the node's rank to the<br/> lower of the costs, if already present."];
    noPath("No path found.");
    goal("Path to goal found,<br>with lowest cost.");

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

export const UniformCostSearch: ISearch = {
  flowchart,
  *search(start, isGoal) {
    const prioritySet = new PriorityNodeSet();
    yield* search(start, prioritySet, isGoal);
  }
};
