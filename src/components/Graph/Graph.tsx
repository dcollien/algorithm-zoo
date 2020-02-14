import React from "react";
import { AnimatedCanvas } from "../AnimatedCanvas/AnimatedCanvas";
import { Edge, GraphNode } from "../../dataStructures/Graph";

export interface DrawnEdge extends Edge {
  width?: number;
  stroke?: string;
  label?: string;
  destination: DrawnGraphNode;
}

export interface DrawnGraphNode extends GraphNode {
  label?: string;
  labelColor?: string;
  fill?: string;
  stroke?: string;
  radius?: number;
  edges?: DrawnEdge[];
}

export type DrawnGraph = DrawnGraphNode[];

export interface NodeStyle {
  stroke?: string;
  fill?: string;
  labelColor?: string;
}

export interface EdgeStyle {
  stroke?: string;
}

export interface IGraphSearchProps {
  width: number;
  height: number;
  graph: DrawnGraph;
  onUpdate: (dt: number) => void;
  isAnimating: boolean;
  nodeStyles?: Map<GraphNode, NodeStyle>;
  edgeStyles?: Map<Edge, EdgeStyle>;
}

const drawEdges = (
  ctx: CanvasRenderingContext2D,
  node: DrawnGraphNode,
  edgeStyles?: Map<Edge, EdgeStyle>
) => {
  ctx.save();

  node.edges?.map(edge => {
    const edgeStyle = edgeStyles?.get(edge);
    ctx.strokeStyle = edgeStyle?.stroke
      ? edgeStyle.stroke
      : edge.stroke || "black";
    ctx.lineWidth = edge.width || 2;
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(edge.destination.x, edge.destination.y);
    ctx.stroke();

    if (edge.label) {
      const midX = (node.x + edge.destination.x) / 2;
      const midY = (node.y + edge.destination.y) / 2;
      const textHeight = 16;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${textHeight}px Arial`;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#888";
      const textMetrics = ctx.measureText(edge.label);
      const padding = 4;
      const boxWidth = textMetrics.width + padding * 2;
      const boxHeight = textHeight + padding * 2;
      ctx.beginPath();
      ctx.rect(midX - boxWidth / 2, midY - boxHeight / 2, boxWidth, boxHeight);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = edge.stroke || "black";
      ctx.fillText(edge.label, midX, midY);
    }
  });

  ctx.restore();
};

const drawNode = (
  ctx: CanvasRenderingContext2D,
  node: DrawnGraphNode,
  nodeStyle?: NodeStyle
) => {
  const defaultRadius = 16;
  ctx.save();
  ctx.translate(node.x, node.y);
  ctx.lineWidth = 1;
  ctx.strokeStyle = nodeStyle?.stroke
    ? nodeStyle.stroke
    : node.stroke || "black";
  ctx.fillStyle = nodeStyle?.fill ? nodeStyle.fill : node.fill || "white";
  ctx.beginPath();
  ctx.arc(
    0,
    0,
    node.radius !== undefined ? node.radius : defaultRadius,
    0,
    2 * Math.PI
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (node.label) {
    const padding = 8;
    const textHeight = (node.radius || defaultRadius) * 2 - padding * 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${textHeight}px Arial`;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#888";
    ctx.fillStyle = nodeStyle?.labelColor
      ? nodeStyle.labelColor
      : node.labelColor || "black";
    ctx.fillText(node.label, 0, 0);
  }
  ctx.restore();
};

export const Graph: React.FC<IGraphSearchProps> = ({
  width,
  height,
  graph,
  nodeStyles,
  edgeStyles,
  onUpdate,
  isAnimating
}) => {
  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    graph.map(node => {
      drawEdges(ctx, node, edgeStyles);
    });

    graph.map(node => {
      drawNode(ctx, node, nodeStyles?.get(node));
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
