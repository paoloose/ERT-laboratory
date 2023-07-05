import { useEffect, useRef } from 'react';
import styles from '@/styles/ERTCanvas.module.scss';
import { useEventListener } from '@/hooks/useEventListener';
import { getCanvasContext2D, getGridCell, getRelativeMousePos } from '@/utils/canvas';
import { DrawingState, useDrawingStore } from '@/stores/drawingStore';
import { getColorFromResistivity } from '@/utils/colorMaps';

export function ERTCanvas({ initialState }: { initialState: ERTCanvas }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<ERTCanvas>(initialState).current;

  const drawingStore = useRef<DrawingState>(useDrawingStore.getState());

  useEventListener('pointerup', () => { state.isDragging = false; });
  const handlePointerDown = () => { state.isDragging = true; };
  const handlePointerBlur = () => { state.isDragging = false; };

  useEffect(() => {
    const ctx = getCanvasContext2D(canvasRef.current)!;
    ctx.canvas.width = initialState.world_size.x;
    ctx.canvas.height = initialState.world_size.y;

    ctx.lineWidth = state.pixe_size;
  }, [initialState, state]);

  useEffect(() => useDrawingStore.subscribe((store) => {
    drawingStore.current = store;
  }));

  const handlePointerMove = (e: CanvasPointerEvent) => {
    if (state.isDragging) {
      const pos = getRelativeMousePos(e);
      const cell = getGridCell(pos, state);

      const ctx = getCanvasContext2D(canvasRef.current)!;
      ctx.fillStyle = getColorFromResistivity(drawingStore.current.selected_resistivity.value);

      if (drawingStore.current.selected_tool.name === 'pencil') {
        ctx.fillRect(
          cell.x * state.pixe_size,
          cell.y * state.pixe_size,
          state.pixe_size,
          state.pixe_size
        );
      } else {
        ctx.clearRect(
          cell.x * state.pixe_size,
          cell.y * state.pixe_size,
          state.pixe_size,
          state.pixe_size
        );
      }
    }
    state.last_mouse.x = Math.ceil(e.pageX - e.currentTarget.offsetLeft);
    state.last_mouse.y = Math.ceil(e.pageY - e.currentTarget.offsetTop);
  };

  return (
    <section className={styles.container}>
      <canvas
        ref={canvasRef}
        className={styles.canvasInput}
        onPointerMove={(handlePointerMove)}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerBlur}
        onMouseDown={(e) => { if (e.detail > 1) e.preventDefault(); }}
        // Prevent selection on double click: https://stackoverflow.com/q/880512/18114046
      />
    </section>
  );
}
