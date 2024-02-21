import React from "react";
import { MotionPlanningDemo, IMotionPlanningExamples } from "./MotionPlanningDemo";

import exampleFloorplan from "./exampleFloorplan.png";

const initialAgent = {
  position: { x: 128, y: 128 },
  angle: 0,
  radius: 16
};

const EXAMPLES: IMotionPlanningExamples = {
  "Drone (Holonomic)": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    algorithm: "RRT*"
  },
  "Drone - Goal bias 5%": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    goalBias: 0.05,
    algorithm: "RRT*"
  },
  "Drone - Goal bias 10%": {
    isSteering: false,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    goalBias: 0.1,
    algorithm: "RRT*"
  },
  "Vacuum Cleaner (Dubins Path)": {
    isSteering: true,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    turnRadius: 40,
    algorithm: "RRT*"
  },
  "Vacuum Cleaner - Goal bias 10%": {
    isSteering: true,
    floorplanUrl: exampleFloorplan,
    initialAgent,
    turnRadius: 40,
    goalBias: 0.1,
    algorithm: "RRT*"
  }
};

const RRTStarDemo: React.FC<{ demo: string }> = () => (
  <MotionPlanningDemo examples={EXAMPLES} />
);

export default RRTStarDemo;
