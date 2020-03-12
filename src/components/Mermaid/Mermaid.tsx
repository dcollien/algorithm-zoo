import React, { useState, useEffect } from "react";
import mermaid from 'mermaid';
import mermaidAPI from "mermaid/mermaidAPI";

mermaid.mermaidAPI.initialize({
  theme: "neutral",
  startOnLoad: false,
  fontFamily: "'Roboto', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
} as mermaidAPI.Config);

interface IMermaidProps {
  id: string;
  children: string;
}

export const Mermaid: React.FC<IMermaidProps> = ({ id, children }) => {
  const [svg, setSvg] = useState<string>('');
  
  useEffect(() => {
    mermaid.mermaidAPI.render(id, children, (svgString) => {
      setSvg(svgString);
    });
  }, [id, children]);

  return <div dangerouslySetInnerHTML={{ __html: svg}}></div>;
};
