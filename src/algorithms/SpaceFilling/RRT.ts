export type ExtendFunc<Q> = (
  from: Q,
  to: Q
) => {
  newNode?: Q;
  isGoal: boolean;
  samples?: Q[];
};

export interface IRRTOptions<Q> {
  // Generate a random configuration
  random: () => Q;

  // Extend from a node toward a configuration,
  // returning {newNode, isGoal}
  // A node of null indicates no connection to the destination
  extend: ExtendFunc<Q>;

  // Distance from one node to another
  distance: (from: Q, to: Q) => number;

  // Iterations before giving up
  maxIterations: number;

  // Provide intermediate steps along a path
  sample?: (from: Q, to: Q) => Q[];
}

export interface IRRTStarOptions<Q> extends IRRTOptions<Q> {
  // Exploration radius
  radius: number;
}

export enum Status {
  Start = "start",
  IterationCheck = "iterationCheck",
  RandomConfig = "randomConfig",
  NearestNeighbour = "nearestNeighbour",
  Extend = "extend",
  CanConnect = "canConnect",
  AddToTree = "addToTree",
  GoalCheck = "goalCheck",
  Increment = "increment",
  GoalFound = "success",
  Fail = "fail",

  // RRT* States
  FindNeighbourhood = "findNeighbourhood",
  FindLowestCostNeighbour = "findLowestCostNeighbour",
  Rewire = "rewire"
}

export interface Edge<Q> {
  destination: Q;
  samples?: Q[];
}

export interface IStepResult<Q> {
  status: Status;
  nodes: Q[];
  edges: Map<Q, Edge<Q>[]>;
  i: number;
  isPassed?: boolean;
  randomNode?: Q;
  nearestNode?: Q;
  newNode?: Q | null;
  neighbourhood?: [number, Q][];
  neighbourhoodRadius?: number;
  lowestCostNode?: Q;
}

export type PlanGenerator<Q> = Generator<IStepResult<Q>, IStepResult<Q>>;

export class RRT<Q> {
  options: IRRTOptions<Q>;
  generator?: PlanGenerator<Q>;

  constructor(options: IRRTOptions<Q>) {
    this.options = options;
  }

  generatePlan(start: Q): PlanGenerator<Q> {
    this.generator = this.buildGenerator(start);
    return this.generator;
  }

  *buildGenerator(start: Q): PlanGenerator<Q> {
    const nodes = [start];
    const edges = new Map<Q, Edge<Q>[]>();

    let i = 0;

    yield {
      status: Status.Start,
      nodes,
      edges,
      i
    };

    while (i <= this.options.maxIterations) {
      yield {
        status: Status.IterationCheck,
        nodes,
        edges,
        isPassed: true,
        i
      };

      const randomNode = this.options.random();

      yield {
        status: Status.RandomConfig,
        nodes,
        edges,
        randomNode,
        i
      };

      const nearestNode = this.getNearestNode(nodes, randomNode);

      yield {
        status: Status.NearestNeighbour,
        nodes,
        edges,
        randomNode,
        nearestNode,
        i
      };

      const { isGoal, newNode, samples } = this.options.extend(
        nearestNode,
        randomNode
      );

      yield {
        status: Status.Extend,
        nodes,
        edges,
        randomNode,
        nearestNode,
        newNode,
        i
      };

      if (newNode) {
        yield {
          status: Status.CanConnect,
          nodes,
          edges,
          randomNode,
          nearestNode,
          newNode,
          isPassed: true,
          i
        };

        // Add newNode to tree
        nodes.push(newNode);

        // Add edge to tree
        const nodeEdges = edges.get(nearestNode);
        const newNodeEdges = nodeEdges || [];
        newNodeEdges.push({
          destination: newNode,
          samples
        });
        edges.set(nearestNode, newNodeEdges);

        yield {
          status: Status.AddToTree,
          nodes,
          edges,
          randomNode,
          nearestNode,
          newNode,
          i
        };
        if (isGoal) {
          yield {
            status: Status.GoalCheck,
            nodes,
            edges,
            newNode,
            isPassed: true,
            i
          };
          break;
        } else {
          yield {
            status: Status.GoalCheck,
            nodes,
            edges,
            newNode,
            isPassed: false,
            i
          };
        }
      } else {
        yield {
          status: Status.CanConnect,
          nodes,
          edges,
          randomNode,
          nearestNode,
          isPassed: false,
          i
        };
      }

      i++;
      yield {
        status: Status.Increment,
        nodes,
        edges,
        i
      };
    }

    let status = Status.GoalFound;

    if (i > this.options.maxIterations) {
      yield {
        status: Status.IterationCheck,
        nodes,
        edges,
        isPassed: false,
        i
      };
      status = Status.Fail;
    }

    return {
      nodes,
      edges,
      status,
      i
    };
  }

  getNearestNode(nodes: Q[], config: Q) {
    const distances = nodes.map((treeNode: Q): [number, Q] => [
      this.options.distance(treeNode, config),
      treeNode
    ]);

    let nearest = distances[0];
    for (let i = 0; i < distances.length; i++) {
      const candidate = distances[i];
      nearest = candidate[0] < nearest[0] ? candidate : nearest;
    }

    return nearest[1];
  }
}

export class RRTStar<Q> extends RRT<Q> {
  radius: number;
  sample?: (from: Q, to: Q) => Q[];

  constructor(options: IRRTStarOptions<Q>) {
    super(options);
    this.radius = options.radius;
    this.sample = options.sample;
  }

  getNearestNeighbours(nodes: Q[], config: Q) {
    const distances = nodes.map((treeNode: Q): [number, Q] => [
      this.options.distance(treeNode, config),
      treeNode
    ]);

    const nearestDistances = distances.filter(
      ([dist, node]) => dist < this.radius
    );

    return nearestDistances;
  }

  rewireNeighbourhood(
    cost: number,
    newNode: Q,
    neighbourhood: [number, Q][],
    edges: Map<Q, Edge<Q>[]>,
    costs: Map<Q, number>,
    parents: Map<Q, Q>
  ) {
    const newEdges = edges.get(newNode) || [];

    neighbourhood.forEach(([dist, node]) => {
      // For each neighbour, find the original cost
      // and the new cost when connected to the new node
      const originalCost = costs.get(node)!;
      const newCost = cost + dist;

      if (newCost < originalCost) {
        // A better connection exists

        const parent = parents.get(node);
        if (parent !== undefined) {
          // Find the previous parent's edges to this node
          const parentEdges = edges.get(parent);
          let edgeIndex: number | undefined;
          parentEdges?.forEach((edge, i) => {
            if (edge.destination === node) {
              edgeIndex = i;
            }
          });

          if (edgeIndex !== undefined) {
            // Delete the existing edge
            parentEdges?.splice(edgeIndex, 1);
          }

          // Join to the new node instead
          newEdges.push({
            destination: node,
            samples: this.sample && this.sample(newNode, node)
          });

          // Update cost of this node
          costs.set(node, newCost);
        }
      }
    });

    edges.set(newNode, newEdges);
  }

  *buildGenerator(start: Q): PlanGenerator<Q> {
    const nodes = [start];
    const edges = new Map<Q, Edge<Q>[]>();

    const costs = new Map<Q, number>();
    const parents = new Map<Q, Q>();

    costs.set(start, 0);

    let i = 0;

    yield {
      status: Status.Start,
      nodes,
      edges,
      i
    };

    while (i <= this.options.maxIterations) {
      yield {
        status: Status.IterationCheck,
        nodes,
        edges,
        isPassed: true,
        i
      };

      const randomNode = this.options.random();

      yield {
        status: Status.RandomConfig,
        nodes,
        edges,
        randomNode,
        i
      };

      const nearestNode = this.getNearestNode(nodes, randomNode);

      yield {
        status: Status.NearestNeighbour,
        nodes,
        edges,
        randomNode,
        nearestNode,
        i
      };

      const { isGoal, newNode, samples } = this.options.extend(
        nearestNode,
        randomNode
      );

      yield {
        status: Status.Extend,
        nodes,
        edges,
        randomNode,
        nearestNode,
        newNode,
        i
      };

      if (newNode) {
        yield {
          status: Status.CanConnect,
          nodes,
          edges,
          randomNode,
          nearestNode,
          newNode,
          isPassed: true,
          i
        };

        // Find neighbourhood
        const neighbourhood = this.getNearestNeighbours(nodes, newNode);

        yield {
          status: Status.FindNeighbourhood,
          nodes,
          edges,
          randomNode,
          newNode,
          neighbourhood,
          neighbourhoodRadius: this.radius,
          i
        };

        // find Lowest cost neighbour
        const neighbourhoodCosts: [
          number,
          Q
        ][] = neighbourhood.map(([dist, node]) => [
          costs.get(node)! + dist,
          node
        ]);

        const lowestCostNeighbour = neighbourhoodCosts.reduce(
          (lowest, [cost, node]) => {
            if (cost < lowest[0]) {
              return [cost, node];
            }
            return lowest;
          },
          [
            costs.get(nearestNode)! +
              this.options.distance(nearestNode, newNode),
            nearestNode
          ]
        );

        const [cost, lowestCostNode] = lowestCostNeighbour;

        yield {
          status: Status.FindLowestCostNeighbour,
          nodes,
          edges,
          newNode,
          neighbourhood,
          neighbourhoodRadius: this.radius,
          lowestCostNode,
          i
        };

        // Add newNode to tree
        nodes.push(newNode);

        // Add edge to tree, joined from lowestCostNode
        const nodeEdges = edges.get(lowestCostNode);
        const newNodeEdges = nodeEdges || [];
        newNodeEdges.push({
          destination: newNode,
          samples
        });
        edges.set(lowestCostNode, newNodeEdges);

        // Record cost
        costs.set(newNode, cost);

        yield {
          status: Status.AddToTree,
          nodes,
          edges,
          newNode,
          neighbourhood,
          neighbourhoodRadius: this.radius,
          lowestCostNode,
          i
        };

        // Rewire
        this.rewireNeighbourhood(
          cost,
          newNode,
          neighbourhood,
          edges,
          costs,
          parents
        );

        yield {
          status: Status.Rewire,
          nodes,
          edges,
          newNode,
          neighbourhood,
          neighbourhoodRadius: this.radius,
          lowestCostNode,
          i
        };

        if (isGoal) {
          yield {
            status: Status.GoalCheck,
            nodes,
            edges,
            newNode,
            isPassed: true,
            i
          };
          break;
        } else {
          yield {
            status: Status.GoalCheck,
            nodes,
            edges,
            newNode,
            isPassed: false,
            i
          };
        }
      } else {
        yield {
          status: Status.CanConnect,
          nodes,
          edges,
          randomNode,
          nearestNode,
          isPassed: false,
          i
        };
      }

      i++;
      yield {
        status: Status.Increment,
        nodes,
        edges,
        i
      };
    }

    let status = Status.GoalFound;

    if (i > this.options.maxIterations) {
      yield {
        status: Status.IterationCheck,
        nodes,
        edges,
        isPassed: false,
        i
      };
      status = Status.Fail;
    }

    return {
      nodes,
      edges,
      status,
      i
    };
  }
}
