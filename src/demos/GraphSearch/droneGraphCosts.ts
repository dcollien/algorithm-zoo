import { DrawnGraphNode } from "../../components/Graph/Graph";

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
  { label: "1", weight: 1, destination: i }
];
h.edges = [{ label: "1", weight: 1, destination: j }];
j.edges = [{ label: "1", weight: 1, destination: k }];
i.edges = [{ label: "4", weight: 4, destination: k }];

const graph: DrawnGraphNode[] = [a, b, c, d, e, f, g, h, i, j, k];

const goals = new Set([k]);

export const droneGraphCosts = {
  start: a,
  graph,
  goals
};
