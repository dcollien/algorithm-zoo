import { DrawnGraphNode } from "../../components/Graph/Graph";
import { euclidean } from "../../algorithms/DiscreteSearch/heuristics";
import { GraphNode } from "../../dataStructures/Graph";
import { SearchStrategy } from "./SearchDemo";

const a: DrawnGraphNode = {
  label: "A",
  x: 150,
  y: 50,
  edges: []
};

const b: DrawnGraphNode = {
  label: "B",
  x: a.x,
  y: a.y + 100,
  edges: []
};

const c: DrawnGraphNode = {
  label: "C",
  x: b.x,
  y: b.x + 100,
  edges: []
};

const d: DrawnGraphNode = {
  label: "D",
  x: b.x + 200,
  y: b.y - 15,
  edges: []
};

const e: DrawnGraphNode = {
  label: "E",
  x: 50,
  y: c.y + 100,
  edges: []
};

const f: DrawnGraphNode = {
  label: "F",
  x: c.x,
  y: c.y + 125,
  edges: []
};

const g: DrawnGraphNode = {
  label: "G",
  x: d.x,
  y: d.y + 100,
  edges: []
};

const h: DrawnGraphNode = {
  label: "H",
  x: g.x - 100,
  y: g.y + 100,
  edges: []
};

const i: DrawnGraphNode = {
  label: "I",
  x: g.x + 100,
  y: g.y + 10,
  edges: []
};

const j: DrawnGraphNode = {
  label: "J",
  x: g.x,
  y: h.y + 35,
  edges: []
};

const k: DrawnGraphNode = {
  label: "K",
  x: i.x,
  y: j.y + 35,
  edges: []
};

a.edges = [
  {
    label: "1",
    weight: 1,
    destination: b
  }
];
b.edges = [
  {
    label: "1",
    weight: 1,
    destination: c
  },
  {
    label: "3",
    weight: 3,
    destination: d
  }
];
c.edges = [
  {
    label: "1",
    weight: 1,
    destination: e
  },
  {
    label: "2",
    weight: 2,
    destination: f
  }
];
d.edges = [{ label: "1", weight: 1, destination: g }];
g.edges = [
  { label: "2", weight: 2, destination: h },
  { label: "2", weight: 2, destination: i }
];
h.edges = [{ label: "1", weight: 1, destination: j }];
j.edges = [{ label: "1", weight: 1, destination: k }];
i.edges = [{ label: "3", weight: 3, destination: k }];

const graph: DrawnGraphNode[] = [a, b, c, d, e, f, g, h, i, j, k];

const goals = new Set([k]);

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
      goal, divided by 150. The edge C to E has the largest distance to edge
      weight ratio, and the distance of this edge (of weight 1) is under 150
      pixels. Dividing by 150 will therefore ensure that the heuristic value
      will not dominate the edge costs (it is always an under-estimate). Such a
      heuristic is said to be "admissible", resulting in the search always
      finding the shortest cost path.
    </>
  ),
  func: (goal: GraphNode) => (node: GraphNode) => euclidean(goal)(node) / 150
};

export const droneGraphCosts = {
  start: a,
  graph,
  goals,
  width: 480,
  height: 540,
  heuristics: {
    [SearchStrategy.A_STAR]: aStarHeuristic,
    [SearchStrategy.BEST_FIRST]: greedyHeuristic
  }
};
