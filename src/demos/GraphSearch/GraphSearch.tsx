import React, { useState, useEffect, useCallback } from "react";

import {
  Graph,
  DrawnGraph,
  NodeStyle,
  EdgeStyle,
  DrawnGraphNode
} from "../../components/Graph/Graph";
import { NodeInfo } from "../../components/Graph/NodeInfo";
import { StepPlayer } from "../../components/StepPlayer/StepPlayer";
import { Mermaid } from "../../components/Mermaid/Mermaid";
import { css } from '@emotion/css';
import {
  ISearch,
  startResult,
  SearchStepResult
} from "../../algorithms/DiscreteSearch/search";
import { GraphNode, Edge } from "../../dataStructures/Graph";
import { DataCollectionDiagram } from "../../components/DataCollectionDiagram/DataCollectionDiagram";
import { IMember } from "../../algorithms/DiscreteSearch/nodeSets";
import { toolbarContainer } from "../../styles/toolbar";
import useTick from "../../hooks/useTick";

interface IGraphSearchProps {
  search: ISearch;
  graph: DrawnGraph;
  start: GraphNode;
  goals: Set<GraphNode>;
  examples?: string[];
  heuristic?: (node: GraphNode) => number;
  width?: number;
  height?: number;
  onExampleSelect?: (example: string) => void;
  children?: React.ReactNode;
}

const rowCss = css({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap"
});

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

const graphContainerCss = css`
  display: inline-block;
`;

const graphCss = css`
  border: 1px solid #444;
`;

const environmentArea = css`
  position: sticky;
  top: 60px;
  z-index: 0;
`;

const convertCollectionMember = (member: IMember) => {
  const node: DrawnGraphNode = member.value;
  return {
    rank: member.rank,
    value: node.label || ""
  };
};

export const GraphSearch: React.FC<IGraphSearchProps> = ({
  search,
  graph,
  start,
  goals,
  heuristic,
  children,
  width = 720,
  height = 240
}) => {
  const isGoal = useCallback((node: GraphNode) => goals.has(node), [goals]);
  const [isRendering, setIsRendering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0);
  const [canStep, setCanStep] = useState(true);
  const [searchGenerator, setSearchGenerator] = useState(() =>
    search.search(start, isGoal, heuristic)
  );
  const [searchStep, setSearchStep] = useState<SearchStepResult>(startResult);
  const [nodeStyles, setNodeStyles] = useState<Map<GraphNode, NodeStyle>>(
    () => new Map<GraphNode, NodeStyle>()
  );
  const [edgeStyles, setEdgeStyles] = useState<Map<Edge, EdgeStyle>>(
    () => new Map<Edge, EdgeStyle>()
  );

  const isStepInFlowchart = (candidateSearchStep: SearchStepResult | undefined) =>
    candidateSearchStep &&
    search.flowchart?.steps.has(candidateSearchStep.status);

  const [play, pause] = useTick(() => {
    onStep();
  }, speed ? 100 : 500);

  const onStop = () => {
    setIsPlaying(false);
  };

  const onReset = () => {
    onStop();
    setSearchGenerator(search.search(start, isGoal, heuristic));
    setSearchStep(startResult);
    setCanStep(true);
    setIsRendering(true);
  };

  const onUpdate = (dt: number) => {
    //setIsRendering(false);
  };

  const onStep = () => {
    let nextSearchStep;
    let isDone = false;
    do {
      const nextResult = searchGenerator.next();
      if (nextResult.done) {
        setCanStep(false);
        isDone = true;
        break;
      }
      nextSearchStep = nextResult.value;
    } while (!isStepInFlowchart(nextSearchStep));

    if (!isDone && nextSearchStep) {
      setSearchStep(nextSearchStep);
    }

    setIsRendering(true);
  };

  const onPlay = () => {
    if (canStep) {
      setIsPlaying(true);
    }
  };
  
  const onSpeedToggle = () => {
    setSpeed(1 - speed);
  };

  useEffect(() => {
    setEdgeStyles(edgeStyles => {
      edgeStyles.clear();

      graph.forEach(node => {
        node.edges?.forEach(edge => {
          edgeStyles.set(edge, {
            stroke: "#999"
          });
        });
      });

      // Style the closed set
      if (searchStep.closedSet !== undefined) {
        searchStep.closedSet.forEach((node: GraphNode) => {
          node.edges?.forEach(edge => {
            edgeStyles.delete(edge);
          });
        });
      }

      // Style the path
      const path = searchStep.getBestPath();
      path.forEach((node, i) => {
        const nextIndex = i + 1;
        const nextNode = i < path.length ? path[nextIndex] : null;

        if (nextNode) {
          node.edges?.forEach(edge => {
            if (edge.destination === nextNode) {
              edgeStyles.set(edge, {
                stroke: "#0f4"
              });
            }
          });
        }
      });

      // Style the neighbours
      if (searchStep.neighbours !== undefined) {
        searchStep.neighbours.forEach(edge => {
          edgeStyles.set(edge, {
            stroke: "red"
          });
        });
      }

      return edgeStyles;
    });

    setNodeStyles(nodeStyles => {
      nodeStyles.clear();

      graph.forEach(node => {
        nodeStyles.set(node, {
          fill: "#eee",
          stroke: "#999"
        });
      });

      // Style the closed set
      if (searchStep.closedSet !== undefined) {
        searchStep.closedSet.forEach((node: GraphNode) => {
          nodeStyles.delete(node);
        });
      }

      // Style the open set
      if (searchStep.openSet !== null) {
        searchStep.openSet
          .members()
          .forEach((member: { value: GraphNode; rank?: number }) => {
            nodeStyles.set(member.value, {
              fill: "#ccf",
              labelColor: "black"
            });
          });
      }

      // Currently Selected Node
      if (searchStep.currentNode !== null) {
        nodeStyles.set(searchStep.currentNode, {
          fill: "#44f",
          labelColor: "white"
        });
      }

      return nodeStyles;
    });
  }, [searchStep, graph]);

  useEffect(() => {
    onReset();
  }, [graph]);

  useEffect(() => {
    setIsRendering(true);
  }, [width, height]);

  useEffect(() => {
    if (!canStep && isPlaying) {
      onStop();
    }
  }, [canStep, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      play();
    } else {
      pause();
    }
  }, [isPlaying]);

  const chart = search.flowchart?.mermaid || "";
  const styledChartSections = [chart];

  if (isStepInFlowchart(searchStep)) {
    styledChartSections.push(
      `style ${searchStep?.status} stroke:#f66,stroke-width:2px`
    );
    if (searchStep?.choice !== undefined) {
      const decisionKey = searchStep?.choice ? "Yes" : "No";
      const decisions = search.flowchart?.decisions[searchStep?.status];
      if (decisions) {
        styledChartSections.push(
          `linkStyle ${decisions[decisionKey]} stroke:#f66`
        );
      }
    }
  }

  const styledChart = styledChartSections.join("\n");

  return (
    <div>
      <div className={toolbarCss}>
        <StepPlayer
          onStep={onStep}
          onPlay={onPlay}
          onStop={onStop}
          onReset={onReset}
          onSpeedToggle={onSpeedToggle}
          speed={speed}
          canStep={canStep}
          canReset={!isPlaying}
          isPlaying={isPlaying}
        />
      </div>
      <div>{children}</div>
      <div className={rowCss}>
        <div className={graphContainerCss}>
          <div className={environmentArea}>
            <NodeInfo
              currentNode={searchStep.currentNode}
              cost={searchStep.currentCost}
            />
            <Graph
              className={graphCss}
              width={width}
              height={height}
              isAnimating={isRendering}
              graph={graph}
              nodeStyles={nodeStyles}
              edgeStyles={edgeStyles}
              onUpdate={onUpdate}
            />
            {searchStep.openSet && (
              <DataCollectionDiagram
                members={searchStep.openSet
                  ?.members()
                  .map(convertCollectionMember)}
                dataType={searchStep.openSet?.dataType}
              />
            )}
          </div>
        </div>
        <Mermaid id="flowchart">{styledChart}</Mermaid>
      </div>
    </div>
  );
};
