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
    destination: b
  }
];
b.edges = [
  {
    destination: c
  },
  {
    destination: d
  }
];
c.edges = [
  {
    destination: e
  },
  {
    destination: f
  }
];
d.edges = [
  {
    destination: g
  }
];
g.edges = [
  {
    destination: h
  },
  {
    destination: i
  }
];
h.edges = [
  {
    destination: j
  }
];
j.edges = [
  {
    destination: k
  }
];
i.edges = [
  {
    destination: k
  }
];

const graph: DrawnGraphNode[] = [a, b, c, d, e, f, g, h, i, j, k];

const goals = new Set([k]);

export const droneGraph = {
  start: a,
  graph,
  goals
};
