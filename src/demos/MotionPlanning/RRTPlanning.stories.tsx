import React from "react";
import { storiesOf } from "@storybook/react";
import { MotionPlanningDemo, IMotionPlanningExamples } from "./MotionPlanningDemo";

import exampleFloorplan from "./exampleFloorplan.png";

const initialAgent = {
  position: { x: 128, y: 128 },
  angle: 0,
  radius: 16
};

const EXAMPLES: IMotionPlanningExamples = {
  "Drone": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent
  },
  "Drone - Goal bias 5%": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    goalBias: 0.05
  },
  "Drone - Goal bias 10%": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    goalBias: 0.1
  },
  "Vacuum Cleaner": {
    isSteering: true,
    floorplanUrl: exampleFloorplan,
    initialAgent
  }
};

storiesOf("Motion Planning", module).add("RRT", () => (
  <MotionPlanningDemo examples={EXAMPLES} />
));
