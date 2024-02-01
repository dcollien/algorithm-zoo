import React, {
  useEffect,
  useState,
  HTMLAttributes,
  useReducer,
  MouseEventHandler,
  KeyboardEventHandler,
  useRef
} from "react";
import { css } from '@emotion/css';
import { AnimatedCanvas } from "../AnimatedCanvas/AnimatedCanvas";
import { v, VectLike } from "../../utils/vector";
import { M } from "../../utils/math";
import { PixelColor, getRect, isMatchingColor } from "../../utils/imageData";

import { Button } from "reakit/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight
} from "@fortawesome/free-solid-svg-icons";

const floorplanCss = css`
  display: flex;
  flex-direction: column;
  justify-content: center;

  div {
    display: flex;
    justify-content: center;
  }
`;

const buttonCss = css`
  width: 48px;
  height: 48px;
  font-size: 20px;
  line-height: 40px;
  margin: 2px;
  padding: 4px;
`;

export interface IAgent {
  position: VectLike;
  angle: number;
  radius: number;
}

enum Action {
  DRIVE_AGENT = 1,
  TRANSLATE_AGENT = 2,
  COMMAND_AGENT = 3,
  COLLISION = 4,
  CHANGE_FLOORPLAN = 5,
  RESET = 6,
  CHANGE_SETTING = 7
}

enum Command {
  FORWARD = "forward",
  REVERSE = "reverse",
  LEFT = "left",
  RIGHT = "right"
}

interface ICommands {
  [Command.FORWARD]: boolean;
  [Command.REVERSE]: boolean;
  [Command.LEFT]: boolean;
  [Command.RIGHT]: boolean;
}

interface IStateRepresentation {
  commands: ICommands;
  agent: IAgent;
  lastCollision: null | { x: number; y: number };
  floorplan: null | ImageData;
  isSteering: boolean;
  isMovementEnabled: boolean;
}

interface IAction {
  action: Action;
  [key: string]: any;
}

interface IReset extends IAction {
  action: Action.RESET;
  initialState: IStateRepresentation;
}

interface IDriveAgent extends IAction {
  action: Action.DRIVE_AGENT;
  distance?: number;
  angle?: number;
}

interface ITranslateAgent extends IAction {
  action: Action.TRANSLATE_AGENT;
  x: number;
  y: number;
}

interface ICommandAgent extends IAction {
  action: Action.COMMAND_AGENT;
  command: Command;
  isActive: boolean;
}

interface IAgentCollided extends IAction {
  action: Action.COLLISION;
  collision: VectLike;
}

interface IFloorplanChange extends IAction {
  action: Action.CHANGE_FLOORPLAN;
  floorplan: ImageData;
}

interface IChangeSeting extends IAction {
  action: Action.CHANGE_SETTING;
  isMovementEnabled?: boolean;
}

export interface IState {
  reduceAction(action: IAction): IState;
  getAgent(): IAgent;
  getCommands(): ICommands;
  getFloorplan(): null | ImageData;
  getLastCollision(): null | { x: number; y: number };
  isSteering: boolean;
}

interface IReducers {
  [Action.RESET]: (action: IAction) => void;
  [Action.COMMAND_AGENT]: (action: IAction) => void;
  [Action.DRIVE_AGENT]: (action: IAction) => void;
  [Action.TRANSLATE_AGENT]: (action: IAction) => void;
  [Action.COLLISION]: (action: IAction) => void;
  [Action.CHANGE_FLOORPLAN]: (action: IAction) => void;
  [Action.CHANGE_SETTING]: (action: IAction) => void;
}

const actionGuards = {
  [Action.RESET]: (action: IAction): action is IReset =>
    action.action === Action.RESET,
  [Action.COMMAND_AGENT]: (action: IAction): action is ICommandAgent =>
    action.action === Action.COMMAND_AGENT,
  [Action.DRIVE_AGENT]: (action: IAction): action is IDriveAgent =>
    action.action === Action.DRIVE_AGENT,
  [Action.TRANSLATE_AGENT]: (action: IAction): action is ITranslateAgent =>
    action.action === Action.TRANSLATE_AGENT,
  [Action.COLLISION]: (action: IAction): action is IAgentCollided =>
    action.action === Action.COLLISION,
  [Action.CHANGE_FLOORPLAN]: (action: IAction): action is IFloorplanChange =>
    action.action === Action.CHANGE_FLOORPLAN,
  [Action.CHANGE_SETTING]: (action: IAction): action is IChangeSeting =>
    action.action === Action.CHANGE_SETTING
};

const TapButton: React.FC<{
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  onPress: () => void;
  onRelease: () => void;
}> = ({ onPress, onRelease, className, children, disabled = false }) => {
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      onPress();
    }
  };

  const onKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === " " || event.key === "Enter") {
      onRelease();
    }
  };

  return (
    <Button
      className={className}
      onMouseDown={onPress}
      onMouseUp={onRelease}
      onMouseOut={onRelease}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={onRelease}
      onTouchStart={onPress}
      onTouchEnd={onRelease}
      onTouchCancel={onRelease}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

class State implements IState {
  state: IStateRepresentation;
  isSteering: boolean;
  reducers: IReducers;

  constructor(initial: IStateRepresentation) {
    this.state = initial;
    this.isSteering = initial.isSteering;

    this.reducers = {
      [Action.RESET]: (action: IAction) =>
        actionGuards[Action.RESET](action) &&
        this.resetState(action.initialState),
      [Action.COMMAND_AGENT]: (action: IAction) => {
        if (!actionGuards[Action.COMMAND_AGENT](action)) return;
        if (!this.state.isMovementEnabled) return;
        this.state.commands[action.command] = action.isActive;
      },
      [Action.DRIVE_AGENT]: (action: IAction) =>
        actionGuards[Action.DRIVE_AGENT](action) && this.driveAgent(action),
      [Action.TRANSLATE_AGENT]: (action: IAction) =>
        actionGuards[Action.TRANSLATE_AGENT](action) &&
        this.translateAgent(action),
      [Action.COLLISION]: (action: IAction) => {
        if (!actionGuards[Action.COLLISION](action)) {
          return;
        }

        this.collide(action.collision);
        this.state.lastCollision = {
          x: action.collision.x,
          y: action.collision.y
        };
      },
      [Action.CHANGE_FLOORPLAN]: (action: IAction) => {
        if (!actionGuards[Action.CHANGE_FLOORPLAN](action)) return;
        this.state.floorplan = action.floorplan;
      },
      [Action.CHANGE_SETTING]: (action: IAction) => {
        if (!actionGuards[Action.CHANGE_SETTING](action)) return;
        if (action.isMovementEnabled !== undefined) {
          this.state.isMovementEnabled = action.isMovementEnabled;
        }
      }
    };
  }

  resetState(initial: IStateRepresentation) {
    this.state = initial;
    this.isSteering = initial.isSteering;
  }

  updateCollision() {
    const agent = this.getAgent();
    if (
      this.state.lastCollision &&
      v.dist(this.state.lastCollision, agent.position) > agent.radius
    ) {
      this.state.lastCollision = null;
    }
  }

  driveAgent(action: IDriveAgent) {
    if (action.angle) {
      this.turn(action.angle);
    }
    if (action.distance) {
      this.moveForward(action.distance);
      this.updateCollision();
    }
  }

  translateAgent(action: ITranslateAgent) {
    const agent = this.getAgent();
    agent.position = v.add(agent.position, action);
    this.updateCollision();
  }

  reduceAction(action: IAction) {
    this.reducers[action.action](action);
    return this;
  }

  getCommands() {
    return this.state.commands;
  }

  getAgent() {
    return this.state.agent;
  }

  getLastCollision() {
    return this.state.lastCollision;
  }

  getFloorplan() {
    return this.state.floorplan;
  }

  turn(angle: number) {
    const agent = this.getAgent();
    agent.angle += angle;
  }

  moveForward(d: number) {
    const agent = this.getAgent();
    const movement = v.forAngle(agent.angle, d);
    agent.position = v.add(agent.position, movement);
  }

  collide(position: VectLike) {
    const agent = this.getAgent();
    const offset = v.sub(agent.position, position);
    const overshoot = agent.radius - offset.len();
    if (overshoot > 0) {
      const correction = v.scale(offset, Math.ceil(overshoot * 100) / 100);
      agent.position = v.add(agent.position, correction);
    }
  }
}

const handleKeyBindings = <T,>(
  event: React.KeyboardEvent<T>,
  dispatch: React.Dispatch<IAction>
) => {
  if (event.repeat) return;

  const action: ICommandAgent = {
    command: Command.FORWARD,
    action: Action.COMMAND_AGENT,
    isActive: event.type === "keydown"
  };

  switch (event.key.toLowerCase()) {
    case "w":
      dispatch({
        ...action,
        command: Command.FORWARD
      });
      break;
    case "s":
      dispatch({
        ...action,
        command: Command.REVERSE
      });
      break;
    case "a":
      dispatch({
        ...action,
        command: Command.LEFT
      });
      break;
    case "d":
      dispatch({
        ...action,
        command: Command.RIGHT
      });
      break;
  }
};

const detectCollision = (
  floorplan: ImageData,
  color: PixelColor,
  position: VectLike,
  radius: number
) => {
  const [x1, x2] = M.clamp(
    [position.x - radius, position.x + radius],
    floorplan.width
  ).map(Math.floor);
  const [y1, y2] = M.clamp(
    [position.y - radius, position.y + radius],
    floorplan.height
  ).map(Math.floor);

  const rect = getRect(floorplan, x1, y1, x2, y2);

  const collisionPixel = rect.find(
    pixel =>
      isMatchingColor(pixel.color, color) && v.dist(pixel, position) < radius
  );

  if (collisionPixel) {
    return v(collisionPixel.x, collisionPixel.y);
  } else {
    return null;
  }
};

const handleStateUpdate = (
  dt: number,
  state: IState,
  dispatch: React.Dispatch<IAction>,
  onAgentMove: (agent: IAgent) => void
) => {
  const { forward, reverse, left, right } = state.getCommands();
  const floorplan = state.getFloorplan();
  const agent = state.getAgent();

  if (floorplan) {
    const hitCoord = detectCollision(
      floorplan,
      {
        r: 0,
        g: 0,
        b: 0
      },
      agent.position,
      agent.radius
    );

    if (hitCoord) {
      dispatch({
        action: Action.COLLISION,
        collision: hitCoord
      });

      return;
    }
  }

  const thrust = dt * 40;
  const torque = dt * 2;

  let didMove = false;

  if (left && !right) {
    if (state.isSteering) {
      dispatch({
        action: Action.DRIVE_AGENT,
        angle: -torque
      });
    } else {
      dispatch({
        action: Action.TRANSLATE_AGENT,
        x: -thrust,
        y: 0
      });
    }
    didMove = true;
  } else if (right && !left) {
    if (state.isSteering) {
      dispatch({
        action: Action.DRIVE_AGENT,
        angle: torque
      });
    } else {
      dispatch({
        action: Action.TRANSLATE_AGENT,
        x: thrust,
        y: 0
      });
    }
    didMove = true;
  }

  // TODO: normalise translation
  if (forward && !reverse) {
    if (state.isSteering) {
      dispatch({
        action: Action.DRIVE_AGENT,
        distance: thrust
      });
    } else {
      dispatch({
        action: Action.TRANSLATE_AGENT,
        y: -thrust,
        x: 0
      });
    }
    didMove = true;
  } else if (reverse && !forward) {
    if (state.isSteering) {
      dispatch({
        action: Action.DRIVE_AGENT,
        distance: -thrust
      });
    } else {
      dispatch({
        action: Action.TRANSLATE_AGENT,
        y: thrust,
        x: 0
      });
    }
    didMove = true;
  }

  if (didMove) {
    onAgentMove(agent);
  }
};

const getInitialState: (
  agent: IAgent,
  isSteering: boolean
) => IStateRepresentation = (agent, isSteering) => ({
  commands: {
    forward: false,
    reverse: false,
    left: false,
    right: false
  },
  agent,
  lastCollision: null,
  floorplan: null,
  isMovementEnabled: true,
  isSteering
});

const initializer = (initialState: IStateRepresentation) => {
  return new State(initialState);
};

const reducer = (state: IState, action: IAction) => {
  return state.reduceAction(action);
};

export type UpdateFunc = (dt: number) => void;
export type ChangeFloorplanFunc = (floorplan: ImageData) => void;

interface IFloorplanProps extends HTMLAttributes<Element> {
  imageUrl: string;
  renderOverlay: (ctx: CanvasRenderingContext2D, state: IState) => void;
  renderAgent: (ctx: CanvasRenderingContext2D, state: IState) => void;
  agent: IAgent;
  onUpdate: UpdateFunc;
  onSelectPosition?: (position: { x: number; y: number }) => void;
  onDragPosition?: (drag: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
  onReleasePosition?: (drag: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }) => void;
  onAgentMove?: (agent: IAgent) => void;
  isSteering?: boolean;
  onFloorplanChange?: ChangeFloorplanFunc;
  isMovementEnabled?: boolean;
}

export const Floorplan: React.FC<IFloorplanProps> = ({
  imageUrl,
  renderOverlay,
  renderAgent,
  onUpdate,
  agent,
  onAgentMove = (agent: IAgent) => {},
  isSteering = false,
  onFloorplanChange,
  isMovementEnabled,
  onSelectPosition,
  onDragPosition,
  onReleasePosition,
  ...props
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isImageUpdateRequired, setIsImageUpdateRequired] = useState<boolean>(
    true
  );

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setIsImageUpdateRequired(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const width = image?.width || 0;
  const height = image?.height || 0;

  const [isFocussed, setIsFocussed] = useState<boolean>(true);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(agent, isSteering),
    initializer
  );

  const onFocus = () => {
    setIsFocussed(true);
  };

  const onBlur = () => {
    setIsFocussed(false);
  };

  useEffect(() => {
    dispatch({
      action: Action.RESET,
      initialState: getInitialState(agent, isSteering)
    });
    setIsImageUpdateRequired(true);
  }, [agent, isSteering]);

  useEffect(() => {
    dispatch({
      action: Action.CHANGE_SETTING,
      isMovementEnabled: isMovementEnabled
    });
  }, [isMovementEnabled]);

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });

  const handleUpdate = (dt: number) => {
    handleStateUpdate(dt, state, dispatch, onAgentMove);
    onUpdate(dt);
  };

  const onMouseDown: MouseEventHandler<HTMLCanvasElement> = event => {
    const rect = canvasRef.current?.getBoundingClientRect();

    if (rect) {
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      onSelectPosition && onSelectPosition(position);
      setDragStart(position);
    }
    props.onClick && props.onClick(event);
  };

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = event => {
    if (!dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();

    if (rect) {
      onDragPosition &&
        onDragPosition({
          x1: dragStart.x,
          y1: dragStart.y,
          x2: event.clientX - rect.left,
          y2: event.clientY - rect.top
        });
    }
    props.onClick && props.onClick(event);
  };

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = event => {
    if (!dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();

    if (rect) {
      onReleasePosition &&
        onReleasePosition({
          x1: dragStart.x,
          y1: dragStart.y,
          x2: event.clientX - rect.left,
          y2: event.clientY - rect.top
        });
    }

    setDragStart(null);
    props.onClick && props.onClick(event);
  };

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = event => {
    event.stopPropagation();
    props.onKeyDown && props.onKeyDown(event);
    handleKeyBindings(event, dispatch);
  };

  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = event => {
    props.onKeyUp && props.onKeyUp(event);
    handleKeyBindings(event, dispatch);
  };

  const onButtonDown = (command: Command) => () => {
    dispatch({
      action: Action.COMMAND_AGENT,
      isActive: true,
      command
    });
  };

  const onButtonUp = (command: Command) => () => {
    dispatch({
      action: Action.COMMAND_AGENT,
      isActive: false,
      command
    });
  };

  const render = (ctx: CanvasRenderingContext2D) => {
    const stateAgent = state.getAgent();

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (image) {
      ctx.drawImage(image, 0, 0);
      if (isImageUpdateRequired && width > 0 && height > 0) {
        const floorplan = ctx.getImageData(0, 0, width, height);
        onFloorplanChange && onFloorplanChange(floorplan);
        dispatch({
          action: Action.CHANGE_FLOORPLAN,
          floorplan
        });
        setIsImageUpdateRequired(false);
      }
    }

    renderOverlay(ctx, state);

    ctx.save();
    ctx.translate(stateAgent.position.x, stateAgent.position.y);
    ctx.rotate(stateAgent.angle);
    renderAgent(ctx, state);
    ctx.restore();

    const lastCollision = state.getLastCollision();
    if (lastCollision) {
      ctx.save();
      ctx.translate(lastCollision.x, lastCollision.y);
      ctx.fillStyle = "red";
      ctx.fillRect(-1, -1, 2, 2);
      ctx.restore();
    }

    ctx.restore();
  };

  return (
    <div className={floorplanCss} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
      <div>
        <AnimatedCanvas
          ref={canvasRef}
          width={width}
          height={height}
          onFrame={handleUpdate}
          isAnimating={isFocussed}
          render={render}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          {...props}
        />
      </div>
      <div>
        <TapButton
          className={buttonCss}
          onPress={onButtonDown(Command.FORWARD)}
          onRelease={onButtonUp(Command.FORWARD)}
          disabled={!isMovementEnabled}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </TapButton>
        <TapButton
          className={buttonCss}
          onPress={onButtonDown(Command.REVERSE)}
          onRelease={onButtonUp(Command.REVERSE)}
          disabled={!isMovementEnabled}
        >
          <FontAwesomeIcon icon={faArrowDown} />
        </TapButton>
        <TapButton
          className={buttonCss}
          onPress={onButtonDown(Command.LEFT)}
          onRelease={onButtonUp(Command.LEFT)}
          disabled={!isMovementEnabled}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </TapButton>
        <TapButton
          className={buttonCss}
          onPress={onButtonDown(Command.RIGHT)}
          onRelease={onButtonUp(Command.RIGHT)}
          disabled={!isMovementEnabled}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </TapButton>
      </div>
    </div>
  );
};
