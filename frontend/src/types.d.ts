type CanvasPointerEvent = React.PointerEvent<HTMLCanvasElement>;

type Vec2 = {
  x: number;
  y: number;
};

interface ERTCanvas {
  isDragging: boolean;
  world_size: Vec2;
  grid: Vec2;
  last_mouse: Vec2;
  pixe_size: number;
}
