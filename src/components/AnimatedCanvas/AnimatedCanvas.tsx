import React, { useRef, useEffect, useCallback, useState } from "react";

type UpdateHandler = (dt: number) => void;
type ContextRenderer = (ctx: CanvasRenderingContext2D) => void;

export interface IAnimatedCanvasProps {
  width: number;
  height: number;
  onFrame: UpdateHandler;
  render: ContextRenderer;
  isAnimating?: boolean;
}

class Runtime {
  update: UpdateHandler;
  redraw: () => void;
  isAnimating: boolean;
  frameRequest?: number;
  lastStep?: number;

  constructor(update: UpdateHandler, redraw: () => void) {
    this.update = update;
    this.redraw = redraw;
    this.isAnimating = false;
  }

  run() {
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    const step = () => {
      this.step();
      this.frameRequest = window.requestAnimationFrame(step);
    };
    step();
  }

  stop() {
    if (this.frameRequest !== undefined) {
      window.cancelAnimationFrame(this.frameRequest);
    }
    this.frameRequest = undefined;
    this.isAnimating = false;
  }

  step() {
    const now = Date.now();
    const dt = (now - this.lastStep!) / 1000;
    this.lastStep = now;
    this.update(dt);
    this.redraw();
  }
}

export const AnimatedCanvas: React.FC<IAnimatedCanvasProps> = ({
  width,
  height,
  onFrame,
  render,
  isAnimating = true
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [runtime, setRuntime] = useState<Runtime>();

  // when the canvas changes, make a new redraw fn for the new context
  const redraw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d")

    if (ctx) {
      render(ctx);
    }
  }, [render]);

  // when the onFrame handler or redraw fn changes, update the runtime
  useEffect(() => {
    runtime?.stop(); // clean up the previous instance
    setRuntime(new Runtime(onFrame, redraw));
  }, [onFrame, redraw]);

  // when the runtime, or isAnimating flag changes, start/stop the runtime
  useEffect(() => {
    if (isAnimating) {
      runtime?.run();
    } else {
      runtime?.stop();
    }
  }, [runtime, isAnimating]);

  return <canvas width={width} height={height} ref={canvasRef}></canvas>;
};
