import React from "react";
import { storiesOf } from "@storybook/react";
import RRTDemo from "./RRTDemo";
import RRTStarDemo from "./RRTStarDemo";

storiesOf("Motion Planning", module)
  .add("RRT", () => <RRTDemo demo="rrt" />)
  .add("RRT*", () => <RRTStarDemo demo="rrt-star" />);
