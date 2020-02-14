import React, { useState, useEffect } from "react";

import "milligram";

import { Graph, DrawnGraph, NodeStyle, EdgeStyle } from "../../components/Graph/Graph";
import { StepPlayer } from "../../components/StepPlayer/StepPlayer";
import { Mermaid } from "../../components/Mermaid/Mermaid";
import { css } from "emotion";
import {
  ISearch,
  startResult,
  SearchStepResult,
  Status
} from "../../algorithms/DiscreteSearch/search";
import { GraphNode, Edge } from "../../dataStructures/Graph";

interface IGraphSearchProps {
  search: ISearch;
  graph: DrawnGraph;
  start: GraphNode;
  goals: Set<GraphNode>;
  heuristic?: (node: GraphNode) => number;
  width?: number;
  height?: number;
}

const rowCss = css({
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap"
});

const graphContainerCss = css({
  display: "inline-block",
  border: "1px solid #444"
});

export const GraphSearch: React.FC<IGraphSearchProps> = ({
  search,
  graph,
  start,
  goals,
  heuristic,
  width = 720,
  height = 240
}) => {
  const isGoal = (node: GraphNode) => goals.has(node);
  const [isRendering, setIsRendering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<number | undefined>();
  const [canStep, setCanStep] = useState(true);
  const [searchGenerator, setSearchGenerator] = useState(() =>
    search.search(start, isGoal, heuristic)
  );
  const [searchStep, setSearchStep] = useState<SearchStepResult | undefined>(startResult);
  const [nodeStyles, setNodeStyles] = useState<Map<GraphNode, NodeStyle>>(
    () => new Map<GraphNode, NodeStyle>()
  );
  const [edgeStyles, setEdgeStyles] = useState<Map<Edge, EdgeStyle>>(
    () => new Map<Edge, EdgeStyle>()
  );

  const isStepInFlowchart = (candidateSearchStep: SearchStepResult | undefined) =>
    candidateSearchStep &&
    search.flowchart?.steps.has(candidateSearchStep.status);

  useEffect(() => {
    // continue rendering when the graph or styles update
    console.log("Render");
    setIsRendering(true);
  }, [graph, nodeStyles]);

  useEffect(() => {
    if (searchStep !== undefined) {
      nodeStyles.clear();
      edgeStyles.clear();

      graph.map((node) => {
        node.edges?.forEach(edge => {
          edgeStyles.set(edge, {
            stroke: "#999"
          });
        });
        nodeStyles.set(node, {
          fill: "#eee",
          stroke: "#999"
        });
      });

      // Style the closed set
      if (searchStep.closedSet !== undefined) {
        searchStep.closedSet.forEach((node: GraphNode) => {
          node.edges?.forEach(edge => {
            edgeStyles.delete(edge);
          });
          nodeStyles.delete(node);
        });
      }

      // Style the open set
      if (searchStep.openSet !== null) {
        searchStep.openSet.members().forEach((node: GraphNode) => {
          nodeStyles.set(node, {
            fill: "#ccf",
            labelColor: "black"
          });
        });
      }

      // Style the path
      const path = searchStep.getBestPath();
      path.map((node, i) => {
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
        searchStep.neighbours.forEach((edge) => {
          edgeStyles.set(edge, {
            stroke: "red"
          });
        })
      }

      // Currently Selected Node
      if (searchStep.currentNode !== null) {
        nodeStyles.set(searchStep.currentNode, {
          fill: "#44f",
          labelColor: "white"
        });
      }

      setNodeStyles(nodeStyles);
      setEdgeStyles(edgeStyles);
    } else {
      setNodeStyles(new Map<GraphNode, NodeStyle>());
      setEdgeStyles(new Map<Edge, EdgeStyle>());
    }
  }, [searchStep]);

  const onUpdate = (dt: number) => {
    // no need to continue rendering after one update
    setIsRendering(false);
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

    if (!isDone) {
      setSearchStep(nextSearchStep);
    }
  };

  const onPlay = () => {
    if (canStep) {
      setIsPlaying(true);
      const interval = window.setInterval(() => {
        onStep();
      }, 500);
      setPlayInterval(interval);
    }
  };

  const onStop = () => {
    setIsPlaying(false);
    window.clearInterval(playInterval);
  };

  useEffect(() => {
    if (!canStep && isPlaying) {
      onStop();
    }
  }, [canStep, isPlaying]);

  const onReset = () => {
    setNodeStyles(new Map<GraphNode, NodeStyle>());
    setEdgeStyles(new Map<Edge, EdgeStyle>());
    setSearchGenerator(search.search(start, isGoal, heuristic));
    setSearchStep(startResult);
    setCanStep(true);
  };

  const chart = search.flowchart?.mermaid || "";
  const styledChartSections = [chart];

  if (isStepInFlowchart(searchStep)) {
    styledChartSections.push(`style ${searchStep?.status} stroke:#f66,stroke-width:2px`);
    if (searchStep?.choice !== undefined) {
      const decisionKey = searchStep?.choice ? "Yes" : "No";
      const decisions = search.flowchart?.decisions[searchStep?.status];
      if (decisions) {
        styledChartSections.push(`linkStyle ${decisions[decisionKey]} stroke:#f66`);
      }
    }
  }

  const styledChart = styledChartSections.join('\n');

  return (
    <div>
      <div className={rowCss}>
        <StepPlayer
          onStep={onStep}
          onPlay={onPlay}
          onStop={onStop}
          onReset={onReset}
          canStep={canStep}
        />
      </div>
      <div className={rowCss}>
        <div className={graphContainerCss}>
          <Graph
            width={width}
            height={height}
            isAnimating={isRendering}
            graph={graph}
            nodeStyles={nodeStyles}
            edgeStyles={edgeStyles}
            onUpdate={onUpdate}
          />
        </div>
        <Mermaid id="flowchart">{styledChart}</Mermaid>
      </div>
    </div>
  );
};
