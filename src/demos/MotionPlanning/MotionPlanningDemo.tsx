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
        Test
      </RRTPlanning>
    </div>
  );
};
