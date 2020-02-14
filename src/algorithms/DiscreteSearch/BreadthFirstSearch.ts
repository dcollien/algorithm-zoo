import { ISearch, search, Status } from "./search";
import { QueueNodeSet } from "./nodeSets";
import { GraphNode } from "../../dataStructures/Graph";

const flowchart = {
  mermaid: `
    graph TD;

    start("Start");
    initOpenSet["Create a 'queue' of graph nodes.<br/>Push 'start node' onto the 'queue'"];
    initCurrentNode["Set 'current node' to 'start node'"];
    isEmpty{{"Is the 'queue' empty?"}};
    isGoal{{"Is the 'current node' the goal?"}};
    takeFromOpenSet["Remove the front node from the 'queue'<br/>Set 'current node' to this value."];
    expand["Expand the 'current node' into a 'set of neighbours'"];
    neighbours["Add each node in the 'set of neighbours'<br/> onto the end of the 'queue',<br/>skipping any nodes which have already been opened."];
    noPath("No path found.");
    goal("Path to goal found,<br/> with fewest steps.");

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

export const BreadthFirstSearch: ISearch = {
  flowchart,
  *search(start, isGoal) {
    const stack = new QueueNodeSet();
    yield* search(start, stack, isGoal);
  }
};
