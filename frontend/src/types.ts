export type CanvasPointerEvent = React.PointerEvent<HTMLCanvasElement>;

export type Vec2 = {
  x: number;
  y: number;
};

// Use this as a type when talking about resistivity values (Ωm)
export type Resistivity = number;

export type Vec2Pair = [x: number, y: number];

export interface ERTCanvasConfig {
  isDragging: boolean;
  canvasDimensions: Vec2;
  /**
   * A world (layered subsurface) will be constructed from pygimli.meshtools.createWorld
   * with these dimensions in meters
   */
  worldSizeMeters: Vec2;
  /**
   * The minimum size for a canvas grid cell (gridSize x gridSize) in meters
   */
  gridSizeMeters: number;
  lastMouse: Vec2;
}
