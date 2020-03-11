import React, {
  useRef,
  useEffect,
  HTMLAttributes,
  useMemo
} from "react";

type UpdateHandler = (dt: number) => void;
type ContextRenderer = (ctx: CanvasRenderingContext2D) => void;

export interface IAnimatedCanvasProps
  extends HTMLAttributes<HTMLCanvasElement> {
  width: number;
  height: number;
  onFrame: UpdateHandler;
  render: ContextRenderer;
  isAnimating?: boolean;

  ref?: React.RefObject<HTMLCanvasElement>;
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
    this.lastStep = Date.now();
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

const _AnimatedCanvas: React.FC<IAnimatedCanvasProps> = ({
  width,
  height,
  onFrame,
  render,
  isAnimating = true,
  ref,
  ...props
}) => {
  const backupRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = ref || backupRef;

  const runtime = useMemo(
    () => {
      const ctx = canvasRef.current?.getContext("2d");
      return new Runtime(onFrame, () => ctx && render(ctx))
    },
    []
  );

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    runtime.redraw = () => ctx && render(ctx);
  }, [runtime, render]);

  useEffect(() => {
    runtime.update = onFrame;
  }, [runtime, onFrame]);

  // when the runtime, or isAnimating flag changes, start/stop the runtime
  useEffect(() => {
    if (isAnimating) {
      runtime?.run();
    } else {
      runtime?.stop();
    }
    return () => runtime?.stop();
  }, [runtime, isAnimating]);

  return (
    <canvas width={width} height={height} ref={canvasRef} {...props}></canvas>
  );
};

export const AnimatedCanvas = React.memo(_AnimatedCanvas);
