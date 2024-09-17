import React from "react";
import { css } from '@emotion/css';
import { DrawnGraphNode } from "./Graph";

interface INodeInfoProps {
  currentNode: DrawnGraphNode | null;
  cost: number | undefined;
}

const infoCss = css`
  min-height: 40px;
  padding: 4px;
`;

const nodeInfoCss = css`
  display: flex;
`;

const currentNodeCss = css`
  flex-grow: 1;
  display: flex;
  justify-content: space-around;
`;

const nodeCss = (node: DrawnGraphNode) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: ${(node.radius || 16) * 2}px;
  height: ${(node.radius || 16) * 2}px;
  border: 1px solid black;
  background: blue;
  color: white;
`;

export const NodeInfo: React.FC<INodeInfoProps> = ({ currentNode, cost }) => (
  <div className={infoCss}>
    {currentNode && (
      <div className={nodeInfoCss}>
        <div>Current Node:</div>
        <div className={currentNodeCss}>
          <div className={nodeCss(currentNode)}>
            <span>{currentNode.label}</span>
          </div>
          <div>Total Cost: {cost || 0}</div>
        </div>
      </div>
    )}
  </div>
);
