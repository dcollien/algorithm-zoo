import React, { useState } from "react";

import "milligram";

import { Graph, DrawnGraph } from "../../components/Graph/Graph";
import { StepPlayer } from "../../components/StepPlayer/StepPlayer";
import { Mermaid } from "../../components/Mermaid/Mermaid";
import { css } from "emotion";
import { ISearch } from "../../algorithms/DiscreteSearch/search";

interface IGraphSearchProps {
  search: ISearch,
  graph: DrawnGraph
};

const graphContainerCss = css({
  display: "inline-block",
  border: "1px solid #444",
});


export const GraphSearch: React.FC<IGraphSearchProps> = ({ search, graph }) => {
  const [runtime, setRuntime] = useState(() => {
    return 
  });
  const [isRunning, setIsRunning] = useState(true);

  const onUpdate = (dt: number) => {
    setIsRunning(false);
  };

  const onStep = () => {

  };

  const onPlay = () => {

  };

  const onStop = () => {

  };

  const onReset = () => {

  };


  return (
    <div>
      <StepPlayer onStep={onStep} onPlay={onPlay} onStop={onStop} onReset={onReset} />
      <div>
        <div className={graphContainerCss}>
          <Graph width={720} height={240} isAnimating={isRunning} graph={graph} onUpdate={onUpdate}/>
        </div>
        <Mermaid id="flowchart">
          {search.flowchart?.mermaid || ''}
        </Mermaid>
      </div>
    </div>
  );
};
