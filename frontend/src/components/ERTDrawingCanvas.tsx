import { useEffect, useRef } from 'react';
import { useEventListener } from '@/hooks/useEventListener';
import {
  getCanvasContext2D, getGridCell, getRelativeMousePos, metersToPx
} from '@/utils/canvas';
import { DrawingState, useDrawingStore } from '@/stores/drawingStore';
import { getColorFromResistivity } from '@/utils/colorMaps';
import { yeet } from '@/utils/assertions';
import styles from '@/styles/ERTCanvas.module.scss';
import { useCanvasStore } from '@/stores/canvasStore';
import { CanvasPointerEvent, ERTCanvasConfig } from '@/types';
import { canvasToShapes } from '@/lib/canvasToShapes';

// const drawGrid(ctx: CanvasRenderingContext2D, cell: Vec2Pair, gridSize: number) {

export function ERTDrawingCanvas({ initialState }: { initialState: ERTCanvasConfig }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<ERTCanvasConfig>(initialState).current;

  const drawingStore = useRef<DrawingState>(useDrawingStore.getState());

  useEventListener('pointerup', () => { state.isDragging = false; });
  const handlePointerDown = () => { state.isDragging = true; };
  const handlePointerBlur = () => { state.isDragging = false; };

  useEffect(() => {
    const ctx = getCanvasContext2D(canvasRef.current) ?? yeet('Canvas should exist');
    ctx.canvas.width = initialState.canvasDimensions.x;
    ctx.canvas.height = initialState.canvasDimensions.y;

    // Draw saved state
    const { canvasData } = useCanvasStore.getState();
    const gridSizePixels = metersToPx(state.gridSizeMeters, state);

    for (let i = 0; i < canvasData.length; i++) {
      for (let j = 0; j < canvasData[i].length; j++) {
        ctx.fillStyle = getColorFromResistivity(canvasData[i][j]);
        ctx.fillRect(
          j * gridSizePixels,
          i * gridSizePixels,
          gridSizePixels,
          gridSizePixels
        );
      }
    }
  }, [initialState, state]);

  useEffect(() => useDrawingStore.subscribe((store) => {
    drawingStore.current = store;
  }), []);

  const handlePointerMove = (e: CanvasPointerEvent) => {
    if (state.isDragging) {
      const mousePos = getRelativeMousePos(e);
      const cell = getGridCell(mousePos, state);

      const ctx = getCanvasContext2D(canvasRef.current)!;
      const { canvasData } = useCanvasStore.getState();

      if (drawingStore.current.selectedTool.name === 'pencil') {
        const resistivityBrush = drawingStore.current.selectedResistivity.value;
        ctx.fillStyle = getColorFromResistivity(resistivityBrush);
        const gridSizePixels = metersToPx(state.gridSizeMeters, state);

        // TODO: move this to a function and return if nothing is changing
        if (canvasData[cell.y][cell.x] === resistivityBrush) {
          return;
        }
        canvasData[cell.y][cell.x] = resistivityBrush;
        ctx.fillRect(
          cell.x * gridSizePixels,
          cell.y * gridSizePixels,
          gridSizePixels,
          gridSizePixels
        );

        const shapes = canvasToShapes(canvasData);

        useCanvasStore.setState({
          parsedShapes: shapes
        });
      } else {
        const gridSizePixels = metersToPx(state.gridSizeMeters, state);
        ctx.fillStyle = getColorFromResistivity(0);
        if (canvasData[cell.y][cell.x] === 0) {
          return;
        }
        canvasData[cell.y][cell.x] = 0;
        ctx.fillRect(
          cell.x * gridSizePixels,
          cell.y * gridSizePixels,
          gridSizePixels,
          gridSizePixels
        );

        const shapes = canvasToShapes(canvasData);

        useCanvasStore.setState({
          parsedShapes: shapes
        });
      }
    }
    state.lastMouse.x = Math.ceil(e.pageX - e.currentTarget.offsetLeft);
    state.lastMouse.y = Math.ceil(e.pageY - e.currentTarget.offsetTop);
  };

  return (
    <section className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvasInput}
        onPointerMove={(handlePointerMove)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerBlur}
        // Prevent selection on double click: https://stackoverflow.com/q/880512/18114046
        onMouseDown={(e) => { if (e.detail > 1) e.preventDefault(); }}
      />
    </section>
  );
}
