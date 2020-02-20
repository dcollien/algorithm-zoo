import React, { useState, useEffect, Ref } from "react";

import { css } from "emotion";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faBackward,
  faStepForward
} from "@fortawesome/free-solid-svg-icons";

import {
  useToolbarState,
  Toolbar,
  ToolbarItem,
  ToolbarSeparator,
} from "reakit/Toolbar";
import { Button } from "reakit/Button";

import { toolbarCss } from "../../styles/toolbar";

const buttonCss = css({
  minWidth: "100px"
});
interface IStepPlayer {
  onStep: () => void;
  onPlay: () => void;
  onStop: () => void;
  onReset: () => void;
  canStep: boolean;
  canReset: boolean;
}

export const StepPlayer: React.FC<IStepPlayer> = ({
  onStep,
  onPlay,
  onStop,
  onReset,
  canStep,
  canReset
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toolbar = useToolbarState({ loop: true });

  useEffect(() => {
    if (!canStep) {
      setIsPlaying(false);
    }
  }, [canStep]);

  const stepHandler = () => {
    onStep();
  };
  const playPauseHandler = () => {
    if (isPlaying) {
      onStop();
    } else {
      onPlay();
    }
    setIsPlaying(!isPlaying);
  };
  const resetHandler = () => {
    onReset();
  };

  return (
    <div>
      <Toolbar
        className={css(toolbarCss)}
        {...toolbar}
        aria-label="Step/Play Toolbar"
      >
        <ToolbarItem
          {...toolbar}
          as={Button}
          className={buttonCss}
          onClick={stepHandler}
          disabled={!canStep || isPlaying}
        >
          <FontAwesomeIcon icon={faStepForward} /> Step
        </ToolbarItem>
        <ToolbarItem
          {...toolbar}
          as={Button}
          className={buttonCss}
          onClick={playPauseHandler}
          disabled={!canStep}
        >
          {isPlaying ? (
            <>
              <FontAwesomeIcon icon={faPause} /> Pause
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} /> Play
            </>
          )}
        </ToolbarItem>
        <ToolbarSeparator {...toolbar} />
        <ToolbarItem
          {...toolbar}
          as={Button}
          className={buttonCss}
          onClick={resetHandler}
          disabled={!canReset}
        >
          <FontAwesomeIcon icon={faBackward} /> Reset
        </ToolbarItem>
      </Toolbar>
    </div>
  );
};
