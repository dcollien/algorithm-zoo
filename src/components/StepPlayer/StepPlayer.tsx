import React, { useState } from "react";

import { css } from "emotion";

import {
  useToolbarState,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator
} from "reakit/Toolbar";
import { Button } from "reakit/Button";

import { toolbarCss } from "../../styles/toolbar";

interface IStepPlayer {
  onStep: () => void;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
};

export const StepPlayer: React.FC<IStepPlayer> = ({ onStep }) => {
  const [isRunning, setIsRunning] = useState(true);

  const toolbar = useToolbarState({ loop: true });

  const onUpdate = (dt: number) => {
    setIsRunning(false);
  };

  return (
    <div>
      <Toolbar className={css(toolbarCss)} {...toolbar} aria-label="Step/Play Toolbar">
        <ToolbarItem {...toolbar} as={Button}>
          Step
        </ToolbarItem>
        <ToolbarItem {...toolbar} as={Button}>
          Play
        </ToolbarItem>
        <ToolbarSeparator {...toolbar} />
        <ToolbarItem {...toolbar} as={Button}>
          Reset
        </ToolbarItem>
      </Toolbar>
    </div>
  );
};
