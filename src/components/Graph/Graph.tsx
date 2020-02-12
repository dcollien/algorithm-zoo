import React from "react";
import { AnimatedCanvas } from "../AnimatedCanvas/AnimatedCanvas";
import { Edge, GraphNode } from "../../dataStructures/Graph";

export interface DrawnEdge extends Edge {
  width?: number;
  stroke?: string;
  destination: DrawnGraphNode;
}

export interface DrawnGraphNode extends GraphNode {
  fill?: string;
  stroke?: string;
  radius?: number;
  edges?: DrawnEdge[];
}

export type DrawnGraph = DrawnGraphNode[];

export interface IGraphSearchProps {
  width: number;
  height: number;
  graph: DrawnGraph;
  onUpdate: (dt: number) => void;
  isAnimating: boolean;
}

const drawEdges = (ctx: CanvasRenderingContext2D, node: DrawnGraphNode) => {
  ctx.save();

  node.edges?.map((edge) => {
    ctx.strokeStyle = edge.stroke || "black";
    ctx.lineWidth = edge.width || 1;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(edge.destination.x, edge.destination.y);
    ctx.stroke();
  });

  ctx.restore();
};

const drawNode = (ctx: CanvasRenderingContext2D, node: DrawnGraphNode) => {
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = node.stroke || "black";
  ctx.fillStyle = node.fill || "white";
  ctx.beginPath();
  ctx.arc(0, 0, node.radius !== undefined ? node.radius : 16, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
};

export const Graph: React.FC<IGraphSearchProps> = ({
  width,
  height,
  graph,
  onUpdate,
  isAnimating
}) => {
  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    graph.map((node) => {
      drawEdges(ctx, node);
    });

    graph.map((node) => {
      drawNode(ctx, node);
    });
  };

  return (
    <AnimatedCanvas
      width={width}
      height={height}
      onFrame={onUpdate}
      isAnimating={isAnimating}
      render={render}
    />
  );
};
