import React, { useState, useEffect, useCallback } from "react";

import { css } from "emotion";

import {
  IAgent,
  IState,
  Floorplan
} from "../../components/Floorplan/Floorplan";
import { IExampleMotionPlan } from "./MotionPlanningDemo";
import {
  RRT,
  IRRTOptions,
  IStepResult,
  Edge as RRTEdge
} from "../../algorithms/SpaceFilling/RRT";
import {
  holonomic2dConfig,
  RrtNode,
  dubins2dConfig
} from "../../algorithms/SpaceFilling/rrtConfigs";
import { VectLike, v } from "../../utils/vector";
import { PixelColor } from "../../utils/imageData";
import { StepPlayer } from "../../components/StepPlayer/StepPlayer";
import { toolbarContainer } from "../../styles/toolbar";
import { AStarSearch } from "../../algorithms/DiscreteSearch/AStarSearch";
import { GraphNode, Edge } from "../../dataStructures/Graph";
import { euclidean } from "../../algorithms/DiscreteSearch/heuristics";
import { SearchStepResult } from "../../algorithms/DiscreteSearch/search";
import { flowchart } from "../../algorithms/SpaceFilling/rrtFlowchart";
import { Mermaid } from "../../components/Mermaid/Mermaid";
import { dubinsShortestPath, plotDubinsPathGen } from "../../utils/dubins";

const toolbarCss = css`
  ${toolbarContainer}
  background: white;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding-top: 8px;
  z-index: 10;
`;

const rowCss = css({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap"
});

const environmentArea = css`
  position: sticky;
  top: 60px;
  z-index: 0;
`;

const containerCss = css`
  display: inline-block;
`;

const iterationCss = css`
  text-align: center;
`;

interface IRRTPlanningProps {
  example: IExampleMotionPlan;
  children?: React.ReactNode;
  maxExplorationDistance: number;
  maxIterations: number;
}

const isEmpty = (color: PixelColor) =>
  color.r !== 0 || color.g !== 0 || color.b !== 0;
const nodeRadius = 4;

const renderPath = (ctx: CanvasRenderingContext2D, path: PathNode[]) => {
  ctx.save();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#00ff00";

  ctx.beginPath();

  path.forEach((node, i) => {
    if (i === 0) {
      ctx.moveTo(node.x, node.y);
    } else if (node.samples === undefined) {
      ctx.lineTo(node.x, node.y);
    } else {
      node.samples.forEach(sample => {
        ctx.lineTo(sample.x, sample.y);
      });
    }
  });
  ctx.stroke();

  ctx.restore();
};

const renderStep = (
  ctx: CanvasRenderingContext2D,
  planStep: IStepResult<RrtNode, RrtNode> | null,
  goal: VectLike | null,
  turnRadius?: number
) => {
  ctx.save();

  if (planStep) {
    if (planStep.nodes && planStep.edges) {
      const nodes = planStep.nodes;

      ctx.lineWidth = 1;
      ctx.strokeStyle = "black";

      if (planStep.nearestNode && planStep.randomNode) {
        ctx.save();
        ctx.strokeStyle = "#ff0000";

        ctx.beginPath();
        if (turnRadius !== undefined) {
          const path = dubinsShortestPath(planStep.nearestNode, planStep.randomNode, turnRadius);
          const pathSamples = plotDubinsPathGen(path, 1);

          ctx.moveTo(planStep.nearestNode.x, planStep.nearestNode.y);
          for (const sample of pathSamples) {
            ctx.lineTo(sample.x, sample.y);
          }
        } else {
          ctx.moveTo(planStep.nearestNode.x, planStep.nearestNode.y);
          ctx.lineTo(planStep.randomNode.x, planStep.randomNode.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      nodes.forEach(node => {
        const edges = planStep.edges.get(node);

        if (edges) {
          edges.forEach(edge => {
            const destination = edge.destination;
            ctx.beginPath();
            if (turnRadius !== undefined && edge.samples !== undefined) {
              ctx.moveTo(node.x, node.y);
              for (const sample of edge.samples) {
                ctx.lineTo(sample.x, sample.y);
              }
            } else {
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(destination.x, destination.y);
            }

            ctx.stroke();
          });
        }

        ctx.save();
        if (planStep.nearestNode && planStep.nearestNode === node) {
          ctx.lineWidth = 2;
          ctx.fillStyle = "#ff00ff";
          ctx.strokeStyle = "black";
        } else {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "black";
          ctx.fillStyle = "#00ffff";
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });
    }

    if (planStep.randomNode) {
      ctx.fillStyle = "#0000ff";
      ctx.beginPath();
      ctx.arc(
        planStep.randomNode.x,
        planStep.randomNode.y,
        nodeRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    }

    if (planStep.newNode) {
      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(
        planStep.newNode.x,
        planStep.newNode.y,
        nodeRadius,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    }
  }

  if (goal) {
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(goal.x - nodeRadius, goal.y - nodeRadius);
    ctx.lineTo(goal.x + nodeRadius, goal.y + nodeRadius);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(goal.x - nodeRadius, goal.y + nodeRadius);
    ctx.lineTo(goal.x + nodeRadius, goal.y - nodeRadius);
    ctx.stroke();
  }

  ctx.restore();
};

interface PathNode {
  x: number,
  y: number,
  samples?: RrtNode[]
};

const findPath = (nodes: RrtNode[], edges: Map<RrtNode, RRTEdge<RrtNode>[]>) => {
  const nodeLookup = new Map<RrtNode, GraphNode>();
  const edgeLookup = new Map<Edge, RRTEdge<RrtNode>>();
  const graph: GraphNode[] = nodes.map(node => {
    const graphNode = {
      x: node.x,
      y: node.y
    };
    nodeLookup.set(node, graphNode);
    return graphNode;
  });

  nodes.forEach(node => {
    const graphNode = nodeLookup.get(node);
    const connectedNodes = edges.get(node);

    if (graphNode && connectedNodes) {
      const edges: Edge[] = [];
      
      connectedNodes
        .forEach(edge => {
          const graphEdge = {
            weight: v.dist(node, edge.destination),
            destination: nodeLookup.get(edge.destination)
          };
          if (graphEdge.destination !== undefined) {
            edgeLookup.set(graphEdge as Edge, edge);
            edges.push(graphEdge as Edge);
          }
        });

      graphNode.edges = edges;
    }
  });

  const goal = graph[graph.length - 1];
  const heuristic = euclidean(goal);
  const search = AStarSearch.search(graph[0], node => node === goal, heuristic);

  let step = search.next();
  let result: SearchStepResult = step.value;
  while (!step.done) {
    step = search.next();
    if (!step.done) {
      result = step.value;
    }
  }

  const nodePath = result.getBestPath();

  const resultPath: PathNode[] = [];
  nodePath.forEach((node, i) => {
    const next = i !== nodePath.length - 1 ? nodePath[i + 1] : null;
    node.edges?.forEach(edge => {
      if (edge.destination === next) {
        const rrtEdge = edgeLookup.get(edge);
        resultPath.push({
          x: node.x,
          y: node.y,
          samples: rrtEdge?.samples 
        });
      }
    })
  });

  return resultPath;
};

export const RRTPlanning: React.FC<IRRTPlanningProps> = ({
  example,
  maxExplorationDistance,
  maxIterations,
  children
}) => {
  const [speed, setSpeed] = useState(0);
  const [playInterval, setPlayInterval] = useState<number | undefined>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [planStep, setPlanStep] = useState<IStepResult<
    RrtNode,
    RrtNode
  > | null>(null);
  const [canStep, setCanStep] = useState<boolean>(true);
  const [path, setPath] = useState<PathNode[] | null>(null);

  const [start, setStart] = useState<RrtNode>(() => ({
    ...example.initialAgent.position,
    angle: example.initialAgent.angle
  }));

  const [goal, setGoal] = useState<VectLike | null>(null);
  const [rrtConfig, setRrtConfig] = useState<IRRTOptions<
    RrtNode,
    RrtNode
  > | null>(null);
  const [rrtPlanner, setRrtPlanner] = useState<RRT<RrtNode, RrtNode> | null>(
    null
  );
  const [floorplanImage, setFloorplanImage] = useState<ImageData | null>(null);

  const renderOverlay = (ctx: CanvasRenderingContext2D) => {
    renderStep(ctx, planStep, goal, example.turnRadius);
    if (path) {
      renderPath(ctx, path);
    }
  };

  const renderAgent = (ctx: CanvasRenderingContext2D, state: IState) => {
    const agent = state.getAgent();
    const lastCollision = state.getLastCollision();

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, agent.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    if (lastCollision) {
      ctx.fillStyle = "#ff0000";
    } else {
      ctx.fillStyle = "#00ff00";
    }

    ctx.lineWidth = 1;

    if (state.isSteering) {
      ctx.beginPath();
      ctx.arc(agent.radius / 2, -agent.radius / 2, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(agent.radius / 2, agent.radius / 2, 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
  };

  const onUpdate = (dt: number) => {};

  const onFloorplanChange = (floorplan: ImageData) => {
    setFloorplanImage(floorplan);
  };

  useEffect(() => {
    if (floorplanImage === null || goal === null) return;

    if (example.turnRadius !== undefined) {
      setRrtConfig(
        dubins2dConfig(
          floorplanImage,
          goal,
          example.initialAgent.radius,
          isEmpty,
          maxExplorationDistance,
          maxIterations,
          example.turnRadius,
          example.goalBias
        )
      )
    } else {
      setRrtConfig(
        holonomic2dConfig(
          floorplanImage,
          goal,
          example.initialAgent.radius,
          isEmpty,
          maxExplorationDistance,
          maxIterations,
          example.goalBias
        )
      );
    }
  }, [example, floorplanImage, goal, maxExplorationDistance]);

  useEffect(() => {
    if (rrtConfig !== null) {
      if (rrtPlanner) {
        rrtPlanner.options = rrtConfig;
        setRrtPlanner(rrtPlanner);
      } else {
        setRrtPlanner(new RRT(rrtConfig));
      }
    }
  }, [rrtConfig, rrtPlanner]);

  const getGenerator = useCallback(() => {
    if (rrtPlanner?.generator) {
      return rrtPlanner.generator;
    } else if (rrtPlanner) {
      return rrtPlanner.generatePlan(start);
    } else {
      return null;
    }
  }, [rrtPlanner, start]);

  const onStop = useCallback(() => {
    setIsPlaying(false);
    setPlayInterval(playInterval => {
      window.clearInterval(playInterval);
      return undefined;
    });
  }, []);

  useEffect(() => {
    if (!canStep && isPlaying) {
      onStop();
    }
    return () => {
      window.clearInterval(playInterval);
    };
  }, [canStep, isPlaying, onStop, playInterval]);

  const onReset = useCallback(() => {
    onStop();

    setRrtPlanner(rrtPlanner => {
      if (rrtPlanner) {
        rrtPlanner.generator = undefined;
      }
      return rrtPlanner;
    });

    setPlanStep(null);
    setCanStep(true);
    setPath(null);
  }, [onStop]);

  useEffect(() => {
    onReset();
  }, [example]);

  const handleClick = (position: { x: number; y: number }) => {
    if (!rrtPlanner?.generator) {
      setGoal({
        x: Math.floor(position.x),
        y: Math.floor(position.y)
      });
    }
  };

  const onAgentMove = (agent: IAgent) => {
    setStart({
      ...agent.position,
      angle: agent.angle
    });
  };

  const onStep = useCallback(() => {
    const generator = getGenerator();

    if (generator) {
      const next = generator.next();
      if (next.done) {
        setCanStep(false);
        setIsPlaying(false);

        const [nodes, edges] = next.value;
        const last = nodes[nodes.length - 1];
        if (goal && v.dist(last, goal) < example.initialAgent.radius) {
          setPath(findPath(nodes, edges));
        }
      } else {
        setPlanStep(next.value);
      }
    }
  }, [getGenerator, example, goal]);

  const onPlay = () => {
    if (canStep) {
      setIsPlaying(true);
      startPlay();
    }
  };

  useEffect(() => {
    if (!canStep && isPlaying) {
      onStop();
    }
    return () => {
      window.clearInterval(playInterval);
    };
  }, [canStep, isPlaying, onStop, playInterval]);

  const startPlay = useCallback(() => {
    setPlayInterval(playInterval => {
      if (playInterval !== undefined) {
        window.clearInterval(playInterval);
      }
      return window.setInterval(
        () => {
          onStep();
        },
        speed === 0 ? 500 : 10
      );
    });
  }, [onStep, speed]);

  const onSpeedToggle = () => {
    setSpeed(1 - speed);
  };

  useEffect(() => {
    if (isPlaying) {
      startPlay();
    }
  }, [speed, isPlaying, startPlay]);

  const decision =
    planStep?.isPassed !== undefined
      ? planStep?.isPassed
        ? "Yes"
        : "No"
      : undefined;

  return (
    <>
      <div className={toolbarCss}>
        <StepPlayer
          onStep={onStep}
          onPlay={onPlay}
          onStop={onStop}
          onReset={onReset}
          onSpeedToggle={onSpeedToggle}
          speed={speed}
          canStep={canStep && goal !== null}
          canReset={!isPlaying}
          isPlaying={isPlaying}
        />
      </div>
      <div>{children}</div>
      <div className={rowCss}>
        <div className={containerCss}>
          <div className={environmentArea}>
            <div className={iterationCss}>{planStep ? <>Iteration: {planStep.i} / {maxIterations}</> : null}</div>
            <Floorplan
              imageUrl={example.floorplanUrl}
              renderOverlay={renderOverlay}
              renderAgent={renderAgent}
              agent={example.initialAgent}
              isMovementEnabled={!rrtPlanner?.generator}
              isSteering={example.turnRadius !== undefined}
              onUpdate={onUpdate}
              onAgentMove={onAgentMove}
              onFloorplanChange={onFloorplanChange}
              onSelectPosition={handleClick}
              tabIndex={0}
            />
          </div>
        </div>
        <div>
          <Mermaid id="flowchart">
            {speed === 1 ? flowchart() : flowchart(planStep?.status, decision)}
          </Mermaid>
        </div>
      </div>
    </>
  );
};
