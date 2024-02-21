export const drawArrow = (ctx: CanvasRenderingContext2D, arrowLength: number, startX: number, startY: number, endX: number, endY: number, startOffset=0, endOffset=0, leftShift=0) => {
  const angle = Math.atan2(endY - startY, endX - startX);

  const shiftX = -Math.sin(angle) * leftShift;
  const shiftY = Math.cos(angle) * leftShift;

  const startOffsetX = Math.cos(angle) * startOffset;
  const startOffsetY = Math.sin(angle) * startOffset;

  const endOffsetX = Math.cos(angle) * endOffset;
  const endOffsetY = Math.sin(angle) * endOffset;

  const lineStartX = startX + startOffsetX + shiftX;
  const lineStartY = startY + startOffsetY + shiftY;
  const lineEndX = endX - endOffsetX + shiftX;
  const lineEndY = endY - endOffsetY + shiftY;

  ctx.save();

  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(lineStartX, lineStartY);
  ctx.lineTo(lineEndX, lineEndY);
  ctx.stroke();

  ctx.save();
  ctx.translate(lineEndX, lineEndY);
  ctx.rotate(angle);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-arrowLength, -arrowLength);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-arrowLength, arrowLength);
  ctx.stroke();

  ctx.restore();

  ctx.restore();
};