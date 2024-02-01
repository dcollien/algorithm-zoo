import React, { useState, FormEvent } from "react";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";
import { RRTPlanning } from "./RRTPlanning";
import { IAgent } from "../../components/Floorplan/Floorplan";
import { css } from '@emotion/css';

const inputCss = css`
  display: inline-block;
  width: 10rem !important;
`;
const inputGridCss = css`
  display: grid;
  grid-template-columns: 20% auto;
`;

export interface IExampleMotionPlan {
  isSteering: boolean;
  floorplanUrl: string;
  initialAgent: IAgent;
  goalBias?: number;
  turnRadius?: number;
  algorithm: "RRT" | "RRT*";
}

export interface IMotionPlanningExamples {
  [key: string]: IExampleMotionPlan;
}

interface IMotionPlanningDemoProps {
  examples: IMotionPlanningExamples;
}

export const MotionPlanningDemo: React.FC<IMotionPlanningDemoProps> = ({
  examples
}) => {
  const firstExample = Object.keys(examples)[0];
  const [examplePlanner, setExamplePlanner] = useState<IExampleMotionPlan>(
    examples[firstExample]
  );
  const [maxExplorationDistance, setMaxExplorationDistance] = useState<number>(
    20
  );
  const [maxIterations, setMaxIterations] = useState<number>(1000);

  const handleExampleChange = (example: string) => {
    setExamplePlanner(examples[example]);
  };

  const handleDistanceChange = (event: React.FormEvent<HTMLInputElement>) => {
    setMaxExplorationDistance(Number.parseInt(event.currentTarget.value));
  };

  const handleMaxIterationsChange = (
    event: React.FormEvent<HTMLInputElement>
  ) => {
    setMaxIterations(Number.parseInt(event.currentTarget.value));
  };

  return (
    <div>
      <div>
        Select from one of the following examples:
        <br />
        <SimpleSelector
          examples={Object.keys(examples)}
          onSelect={handleExampleChange}
        />
        <hr />
      </div>
      <RRTPlanning
        example={examplePlanner}
        maxExplorationDistance={maxExplorationDistance}
        maxIterations={maxIterations}
        neighbourhoodRadius={2 * maxExplorationDistance}
      >
        <div className={inputGridCss}>
          <div>Maximum exploration distance per iteration:</div>
          <div>
            <input
              type="number"
              value={maxExplorationDistance}
              onChange={handleDistanceChange}
              className={inputCss}
            />
          </div>
          <div>Maximum iterations:</div>
          <div>
            <input
              type="number"
              value={maxIterations}
              onChange={handleMaxIterationsChange}
              className={inputCss}
            />
          </div>
        </div>
        <p>
          Drive the agent around the environment using the arrow buttons, or by
          selecting the environment and using the keys 'W', 'A', 'S', 'D'.
        </p>
        <p>
          Click on the environment to place a goal location (and drag to change
          direction), then run the {examplePlanner.algorithm} algorithm. You will need to reset the
          algorithm before changing the goal or agent position.
        </p>
      </RRTPlanning>
    </div>
  );
};
