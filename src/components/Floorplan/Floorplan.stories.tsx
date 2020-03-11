import React, {
  useState,
  MouseEventHandler,
  KeyboardEventHandler,
  useCallback,
  useReducer
} from "react";
import { storiesOf } from "@storybook/react";

import { Floorplan, IAgent, State } from "./Floorplan";

import exampleFloorplan from "./exampleFloorplan.png";

storiesOf("Floorplan", module).add("sample", () => {
  const initialAgent: IAgent = {
    position: { x: 128, y: 128},
    angle: 0,
    radius: 16
  };

  const renderOverlay = () => {};
  const renderAgent = (ctx: CanvasRenderingContext2D, state: State) => {
    const agent = state.getAgent();
    const lastCollision = state.getLastCollision();

    ctx.fillStyle = "blue";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, agent.radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    if (lastCollision) {
      ctx.fillStyle = "#ff0000";
    } else {
      ctx.fillStyle = "#00ff00";
    }

    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(agent.radius/2, -agent.radius/2, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(agent.radius/2, agent.radius/2, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  };

  const onUpdate = (dt: number) => {};

  const onFloorplanChange = (floorplan: ImageData) => {};

  return (
    <>
      <Floorplan
        imageUrl={exampleFloorplan}
        renderOverlay={renderOverlay}
        renderAgent={renderAgent}
        agent={initialAgent}
        onUpdate={onUpdate}
        onFloorplanChange={onFloorplanChange}
        tabIndex={0}
      />
    </>
  );
});
