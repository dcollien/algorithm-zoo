import React, {
  useEffect,
  useState,
  HTMLAttributes,
  useReducer,
  MouseEventHandler,
  KeyboardEventHandler
} from "react";
import { AnimatedCanvas } from "../AnimatedCanvas/AnimatedCanvas";
import { v, VectLike } from '../../utils/vector';
import { M } from "../../utils/math";
import { PixelColor, getRect, isMatchingColor } from "../../utils/imageData";

export interface IAgent {
  position: VectLike;
  angle: number;
  radius: number;
}

enum Action {
  MOVE_AGENT = 1,
  COMMAND_AGENT = 2,
  COLLISION = 3,
  CHANGE_FLOORPLAN = 4
}

enum Command {
  FORWARD = "forward",
  REVERSE = "reverse",
  LEFT = "left",
  RIGHT = "right"
}

interface IStateRepresentation {
  commands: {
    [Command.FORWARD]: boolean;
    [Command.REVERSE]: boolean;
    [Command.LEFT]: boolean;
    [Command.RIGHT]: boolean;
  };
  agent: IAgent;
  lastCollision: null | { x: number; y: number };
  floorplan: null | ImageData;
}

interface IMoveAgent {
  action: Action.MOVE_AGENT;
  distance?: number;
  angle?: number;
}

interface ICommandAgent {
  action: Action.COMMAND_AGENT;
  command: Command;
  isActive: boolean;
}

interface IAgentCollided {
  action: Action.COLLISION;
  collision: VectLike;
}

interface IFloorplanChange {
  action: Action.CHANGE_FLOORPLAN;
  floorplan: ImageData;
}

type IAction = IMoveAgent | ICommandAgent | IAgentCollided | IFloorplanChange;

export class State {
  state: IStateRepresentation;

  constructor(initial: IStateRepresentation) {
    this.state = initial;
  }

  reduceAction(action: IAction) {
    if (action.action === Action.COMMAND_AGENT) {
      this.state.commands[action.command] = action.isActive;
    } else if (action.action === Action.MOVE_AGENT) {
      if (action.angle) {
        this.turn(action.angle);
      }
      if (action.distance) {
        this.moveForward(action.distance);
        const agent = this.getAgent();
        if (this.state.lastCollision && v.dist(this.state.lastCollision, agent.position) > agent.radius) {
          this.state.lastCollision = null;
        }
      }
    } else if (action.action === Action.COLLISION) {
      this.collide(action.collision);
      this.state.lastCollision = {
        x: action.collision.x,
        y: action.collision.y
      };
    } else if (action.action === Action.CHANGE_FLOORPLAN) {
      console.log("CHANGE FLOORPLAN", action.floorplan);
      this.state.floorplan = action.floorplan;
    }
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
      console.log(overshoot);
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
  const [x1, x2] = M.clamp([position.x - radius, position.x + radius], floorplan.width).map(Math.floor);
  const [y1, y2] = M.clamp([position.y - radius, position.y + radius], floorplan.height).map(Math.floor);

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
  state: State,
  dispatch: React.Dispatch<IAction>
) => {
  const { forward, reverse, left, right } = state.getCommands();
  const floorplan = state.getFloorplan();

  if (floorplan) {
    const agent = state.getAgent();

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

  if (left && !right) {
    dispatch({
      action: Action.MOVE_AGENT,
      angle: -torque
    });
  } else if (right && !left) {
    dispatch({
      action: Action.MOVE_AGENT,
      angle: torque
    });
  }

  if (forward && !reverse) {
    dispatch({
      action: Action.MOVE_AGENT,
      distance: thrust
    });
  } else if (reverse && !forward) {
    dispatch({
      action: Action.MOVE_AGENT,
      distance: -thrust
    });
  }
};

const getInitialState: (agent: IAgent) => IStateRepresentation = agent => ({
  commands: {
    forward: false,
    reverse: false,
    left: false,
    right: false
  },
  agent,
  lastCollision: null,
  floorplan: null
});

const initializer = (initialState: IStateRepresentation) => {
  return new State(initialState);
};

const reducer = (state: State, action: IAction) => {
  return state.reduceAction(action);
};

export type UpdateFunc = (dt: number) => void;
export type ChangeFloorplanFunc = (floorplan: ImageData) => void;

interface IFloorplanProps extends HTMLAttributes<HTMLCanvasElement> {
  imageUrl: string;
  renderOverlay: (ctx: CanvasRenderingContext2D, state: State) => void;
  renderAgent: (ctx: CanvasRenderingContext2D, state: State) => void;
  agent: IAgent;
  onUpdate: UpdateFunc;
  onFloorplanChange?: ChangeFloorplanFunc;
}

export const Floorplan: React.FC<IFloorplanProps> = ({
  imageUrl,
  renderOverlay,
  renderAgent,
  onUpdate,
  agent,
  onFloorplanChange,
  ...props
}) => {
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
  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(agent),
    initializer
  );

  const onFocus = () => {
    setIsFocussed(true);
  };

  const onBlur = () => {
    setIsFocussed(false);
  };

  useEffect(() => {
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  });

  const handleUpdate = (dt: number) => {
    handleStateUpdate(dt, state, dispatch);
    onUpdate(dt);
  };

  const onClick: MouseEventHandler<HTMLCanvasElement> = event => {
    props.onClick && props.onClick(event);
  };

  const onKeyDown: KeyboardEventHandler<HTMLCanvasElement> = event => {
    event.stopPropagation();
    handleKeyBindings(event, dispatch);
    props.onKeyDown && props.onKeyDown(event);
  };

  const onKeyUp: KeyboardEventHandler<HTMLCanvasElement> = event => {
    handleKeyBindings(event, dispatch);
    props.onKeyUp && props.onKeyUp(event);
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
    <AnimatedCanvas
      width={width}
      height={height}
      onFrame={handleUpdate}
      isAnimating={isFocussed}
      render={render}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      {...props}
    />
  );
};
