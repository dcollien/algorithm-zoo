export type ExtendFunc<Q, R> = (from: Q, to: R) => [Q | null, boolean];

export interface IRRTOptions<Q, R> {
  // Generate a random configuration
  random: () => R;

  // Extend from a node toward a configuration,
  // returning [node, isGoal]
  // A node of null indicates no connection to the destination
  extend: ExtendFunc<Q, R>;

  // Distance from one node to another
  distance: (from: Q, to: R) => number;

  // Iterations before giving up
  maxIterations: number;
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
  Increment = "increment"
}

export interface IStepResult<Q, R> {
  status: Status;
  nodes: Q[];
  edges: Map<Q, Q[]>;
  i: number;
  isPassed?: boolean;
  randomNode?: R;
  nearestNode?: Q;
  newNode?: Q | null;
}

export type PlanGenerator<Q, R> = Generator<IStepResult<Q, R>, [Q[], Map<Q, Q[]>]>

export class RRT<Q, R> {
  options: IRRTOptions<Q, R>;
  generator?: PlanGenerator<Q, R>;

  constructor(options: IRRTOptions<Q, R>) {
    this.options = options;
  }

  generatePlan(start: Q): PlanGenerator<Q, R> {
    this.generator = this.buildGenerator(start);
    return this.generator;
  }

  *buildGenerator(start: Q): PlanGenerator<Q, R> {
    const nodes = [start];
    const edges = new Map<Q, Q[]>();

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
      }

      const [newNode, isGoal] = this.options.extend(nearestNode, randomNode);

      yield {
        status: Status.Extend,
        nodes,
        edges,
        randomNode,
        nearestNode,
        newNode,
        i
      };

      if (newNode !== null) {
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
        newNodeEdges.push(newNode);
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

      i++;
      yield {
        status: Status.Increment,
        nodes,
        edges,
        i
      };
    }

    if (i > this.options.maxIterations) {
      yield {
        status: Status.IterationCheck,
        nodes,
        edges,
        isPassed: false,
        i
      };
    }

    const result: [Q[], Map<Q, Q[]>] = [nodes, edges];
    return result;
  }

  getNearestNode(nodes: Q[], config: R) {
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
