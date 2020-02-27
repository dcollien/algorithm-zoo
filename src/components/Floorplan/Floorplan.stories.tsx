import React, { useState, MouseEventHandler } from "react";
import { storiesOf } from "@storybook/react";

import { Floorplan, IAgent } from "./Floorplan";

import exampleFloorplan from "./exampleFloorplan.png";

storiesOf("Floorplan", module).add("sample", () => {
  const [agent, setAgent] = useState<IAgent>({ x: 0, y: 0, angle: 0 });

  const floorplanImage = new Image();
  floorplanImage.src = exampleFloorplan;

  const renderOverlay = () => {};
  const renderAgent = () => {}; 
  const onUpdate = (dt: number, floorplan: Uint8ClampedArray) => {};
  const onClick: MouseEventHandler<HTMLCanvasElement> = (event) => {};

  return <>
    <Floorplan image={floorplanImage} renderOverlay={renderOverlay} agent={agent} renderAgent={renderAgent} onUpdate={onUpdate} onClick={onClick} />
  </>;
});
