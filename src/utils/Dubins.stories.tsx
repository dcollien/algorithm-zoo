import React from "react";
import { storiesOf } from "@storybook/react";
import { AnimatedCanvas } from "../components/AnimatedCanvas/AnimatedCanvas";
import { M } from "./math";
import { v } from "./vector";
import { dubinsShortestPath, dubinsPathSample, dubinsPathLength } from "./dubins";

storiesOf("Dubins Curve - testing", module).add("sample", () => {
  const start = {
    x: 400,
    y: 400,
    angle: M.TAU/3
  };

  const end = {
    x: 100,
    y: 200,
    angle: 0
  };

  const turnRadius = 40.0;

  const path = dubinsShortestPath(start, end, turnRadius);
  const pathLength = dubinsPathLength(path);


  console.log('PATH', path);
  console.log('SAMPLE', dubinsPathSample(path, 1.0));

  const render = (ctx: CanvasRenderingContext2D) => {
    //return;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    const samplesArray = [];
    let t = 0;
    while (t < pathLength) {
      samplesArray.push(dubinsPathSample(path, t));
      t += 1.0;
    }

    ctx.moveTo(start.x, start.y);
    samplesArray.forEach(sample => {
      ctx.lineTo(sample.x, sample.y);
    });
    ctx.stroke();

    const startAngle = v.add(start, v.forAngle(start.angle, 20));
    ctx.fillStyle = "red";
    ctx.strokeStyle = "red";
    ctx.fillRect(start.x - 4, start.y - 4, 8, 8);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(startAngle.x, startAngle.y);
    ctx.stroke();


    const endAngle = v.add(end, v.forAngle(end.angle, 20));
    ctx.fillStyle = "blue";
    ctx.strokeStyle = "blue";
    ctx.fillRect(end.x - 4, end.y - 4, 8, 8);
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(endAngle.x, endAngle.y);
    ctx.stroke();
  };

  return <AnimatedCanvas width={640} height={480} onFrame={() => {}} render={render}/>
});