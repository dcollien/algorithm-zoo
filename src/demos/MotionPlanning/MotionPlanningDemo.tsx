import React, { useState, FormEvent } from "react";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";
import { RRTPlanning } from "./RRTPlanning";
import { IAgent } from "../../components/Floorplan/Floorplan";
import { css } from "emotion";

const inputCss = css`
  display: inline-block;
  width: 10rem !important;
`;

export interface IExampleMotionPlan {
  isSteering: boolean;
  floorplanUrl: string;
  initialAgent: IAgent;
  goalBias?: number;
  turnRadius?: number;
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

  const handleExampleChange = (example: string) => {
    console.log("CHANGE EXAMPLE", example);
    setExamplePlanner(examples[example]);
  };

  const handleDistanceChange = (event: React.FormEvent<HTMLInputElement>) => {
    setMaxExplorationDistance(Number.parseInt(event.currentTarget.value));
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
      >
        <p>
          Maximum exploration distance per iteration:{" "}
          <input
            type="number"
            value={maxExplorationDistance}
            onChange={handleDistanceChange}
            className={inputCss}
          />
        </p>
        <p>
          Drive the agent around the environment using the arrow buttons, or by
          selecting the environment and using the keys 'W', 'A', 'S', 'D'.
        </p>
        <p>
          Click on the environment to place a goal location, then run the RRT
          algorithm. You will need to reset the algorithm before changing the
          goal or agent position.
        </p>
      </RRTPlanning>
    </div>
  );
};
