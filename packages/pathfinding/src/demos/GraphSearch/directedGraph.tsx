import { DrawnGraphNode } from "../../components/Graph/Graph";
import { GraphNode } from "../../dataStructures/Graph";
import { euclidean } from "../../algorithms/DiscreteSearch/heuristics";
import { SearchStrategy } from "./SearchDemo";
import { parseGraph } from "../../components/Graph/graphParser";

const graphDefinition = `
A(200, 50)

B(50, 150)
C(150, 150)
D(250, 150)
E(350, 150)

F(50, 250)
G(150, 250)
H(250, 250)
I(350, 250)

J(200, 350)

A--1-->B
A--4-->C
A--6-->D
A--9-->E

B--3-->C
C--2-->D
E--3-->D

H--2-->E
B--1-->F
F--1-->C
D--1-->H
C--3-->G
H--2-->G
H--4-->I
E--1-->I

G--6-->J
F--10-->J
I--2-->J

`;

const graph: DrawnGraphNode[] = parseGraph(graphDefinition);

const goals = new Set([graph[graph.length - 1]]);

const greedyHeuristic = {
  description: (
    <>
      In this case the heuristic is the current node's euclidean distance (in
      pixels) from the goal node. This instructs the search to visit the nodes
      in the order of the geometrically closest to the goal first.
    </>
  ),
  func: (goal: GraphNode) => euclidean(goal)
};

const aStarHeuristic = {
  description: (
    <>
      In this case the heuristic is the euclidean distance (in pixels) from the
      goal, divided by 200. The edge A to B has the largest distance to edge
      weight ratio, and the distance of this edge (of weight 1) is under 200
      pixels. Dividing by 200 will therefore ensure that the heuristic value
      will not dominate the edge costs (it is always an under-estimate). Such a
      heuristic is said to be "admissible", resulting in the search always
      finding the shortest cost path.
    </>
  ),
  func: (goal: GraphNode) => (node: GraphNode) => euclidean(goal)(node) / 200
};

export const directedGraph = {
  start: graph[0],
  graph,
  goals,
  width: 400,
  height: 400,
  heuristics: {
    [SearchStrategy.A_STAR]: aStarHeuristic,
    [SearchStrategy.BEST_FIRST]: greedyHeuristic
  }
};
