import React, { useEffect, useState, HTMLAttributes } from "react";
import { AnimatedCanvas } from "../AnimatedCanvas/AnimatedCanvas";

export interface IAgent {
  x: number;
  y: number;
  angle: number;
}

interface IFloorplanProps extends HTMLAttributes<HTMLCanvasElement> {
  image: HTMLImageElement;
  renderOverlay: (ctx: CanvasRenderingContext2D) => void;
  renderAgent: (ctx: CanvasRenderingContext2D) => void;
  agent: IAgent;
  onUpdate: (dt: number, floorplan: Uint8ClampedArray) => void;
}

export const Floorplan: React.FC<IFloorplanProps> = ({
  image,
  renderOverlay,
  renderAgent,
  agent,
  onUpdate,
  ...props
}) => {
  const [pixelData, setPixelData] = useState<Uint8ClampedArray>(new Uint8ClampedArray());
  const [isFocussed, setIsFocussed] = useState<boolean>(true);
  const onFocus = () => {
    setIsFocussed(true);
  };

  const onBlur = () => {
    setIsFocussed(false);
  };

  const handleUpdate = (dt: number) => onUpdate(dt, pixelData);
  
  useEffect(() => {
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  });

  const width = image.width;
  const height = image.height;

  const render = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    ctx.drawImage(image, 0, 0);

    const floorplanPixels = ctx.getImageData(0, 0, width, height).data;
    setPixelData(floorplanPixels);

    renderOverlay(ctx);
    
    ctx.save();
    ctx.translate(agent.x, agent.y);
    ctx.rotate(agent.angle);
    renderAgent(ctx);
    ctx.restore();

    ctx.restore();
  };

  return (
    <AnimatedCanvas
      width={width}
      height={height}
      onFrame={handleUpdate}
      isAnimating={isFocussed}
      render={render}
      {...props}
    />
  );
};
