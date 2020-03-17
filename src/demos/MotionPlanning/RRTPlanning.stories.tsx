import React from "react";
import { storiesOf } from "@storybook/react";
import RRTDemo from "./RRTDemo";

storiesOf("Motion Planning", module).add("RRT", () => (
  <RRTDemo demo="rrt" />
));
