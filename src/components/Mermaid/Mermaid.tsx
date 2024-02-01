import React, { useState, useEffect, useRef, useId } from "react";
import mermaid from 'mermaid';
import { createPortal } from "react-dom";

mermaid.initialize({
  theme: "neutral",
  startOnLoad: false,
  fontFamily: "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
});

interface IMermaidProps {
  id: string;
  children: string;
  initWidth?: number;
}

export const Mermaid: React.FC<IMermaidProps> = ({ id, children, initWidth }) => {
  const renderId = useId();
  const portalRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [renderNum, setRenderNum] = useState<number>(0);

  const width = initWidth || 800;

  useEffect(() => {
    (async () => {
      const _renderId = "mermaid" + renderId.replace(/:/g, '') + renderNum;
      const element = document.createElement('div');
      element.id = _renderId;
      element.style.width = width + "px";
      element.style.height = "100%";
      element.style.display = "none";

      document.body.appendChild(element);
      const result = await mermaid.render(_renderId, children);
      setSvg(result.svg);
      setRenderNum(renderNum + 1);
      
      element.parentElement?.removeChild(element);
    })();
  }, [children, portalRef.current]);

  return <div style={{width: width + "px"}}>
    <div id={id} dangerouslySetInnerHTML={{ __html: svg }}></div>
  </div>;
};
