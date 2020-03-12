import React, { useState } from "react";
import { SimpleSelector } from "../../components/SimpleSelector/SimpleSelector";
import { RRTPlanning } from "./RRTPlanning";
import { IAgent } from "../../components/Floorplan/Floorplan";

export interface IExampleMotionPlan {
  isSteering: boolean;
  floorplanUrl: string;
  initialAgent: IAgent;
  goalBias?: number;
}

export interface IMotionPlanningExamples {
  [key: string]: IExampleMotionPlan
};

interface IMotionPlanningDemoProps {
  examples: IMotionPlanningExamples
}

export const MotionPlanningDemo: React.FC<IMotionPlanningDemoProps> = ({
  examples
}) => {
  const firstExample = Object.keys(examples)[0];
  const [examplePlanner, setExamplePlanner] = useState<IExampleMotionPlan>(
    examples[firstExample]
  );

  const handleExampleChange = (example: string) => {
    console.log("CHANGE EXAMPLE", example);
    setExamplePlanner(examples[example]);
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
      <RRTPlanning example={examplePlanner}>
        <p>Drive the agent around the environment using the arrow buttons, or by selecting the environment and using the keys 'W', 'A', 'S', 'D'.</p>
        <p>Click on the environment to place a goal location, then run the RRT algorithm. You will need to reset the algorithm before changing the goal or agent position.</p>
      </RRTPlanning>
    </div>
  );
};
