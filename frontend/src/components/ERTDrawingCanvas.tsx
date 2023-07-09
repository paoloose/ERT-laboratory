import { useEffect, useRef } from 'react';
import { useEventListener } from '@/hooks/useEventListener';
import {
  getCanvasContext2D, getGridCell, getRelativeMousePos, metersToPx
} from '@/utils/canvas';
import { DrawingState, useDrawingStore } from '@/stores/drawingStore';
import { getColorFromResistivity } from '@/utils/colorMaps';
import { yeet } from '@/utils/assertions';
import styles from '@/styles/ERTCanvas.module.scss';
import { SubsurfaceShape, useCanvasStore } from '@/stores/canvasStore';
import { CanvasPointerEvent, ERTCanvas } from '@/types';

export function ERTDrawingCanvas({ initialState }: { initialState: ERTCanvas }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef<ERTCanvas>(initialState).current;

  const drawingStore = useRef<DrawingState>(useDrawingStore.getState());

  useEventListener('pointerup', () => { state.isDragging = false; });
  const handlePointerDown = () => { state.isDragging = true; };
  const handlePointerBlur = () => { state.isDragging = false; };

  useEffect(() => {
    const ctx = getCanvasContext2D(canvasRef.current) ?? yeet('Canvas should exist');
    ctx.canvas.width = initialState.canvasDimensions.x;
    ctx.canvas.height = initialState.canvasDimensions.y;
  }, [initialState, state]);

  useEffect(() => useDrawingStore.subscribe((store) => {
    drawingStore.current = store;
  }), []);

  const handlePointerMove = (e: CanvasPointerEvent) => {
    if (state.isDragging) {
      const mousePos = getRelativeMousePos(e);
      const cell = getGridCell(mousePos, state);

      const ctx = getCanvasContext2D(canvasRef.current)!;
      const resistivityBrush = drawingStore.current.selectedResistivity.value;
      ctx.fillStyle = getColorFromResistivity(resistivityBrush);

      const { canvasData } = useCanvasStore.getState();

      if (drawingStore.current.selectedTool.name === 'pencil') {
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

        const shapes: SubsurfaceShape[] = [];
        const [NORTH, EAST, SOUTH, WEST] = [0, 1, 2, 3];
        const MAX_ITERATIONS = 1000;

        // j iterates the matrix in the y-direction
        for (let j = 0; j < canvasData.length; j++) {
          // i iterates the matrix in the x-direction
          for (let i = 0; i < canvasData[j].length; i++) {
            // Note: when referring to directions, use (x=i, y=j)
            //       when actually accessing the matrix, use matrix[y][x]

            // This cell will be the start point of the shape
            const resistivity = canvasData[j][i];
            if (resistivity === 0) {
              continue;
            }
            if (shapes.some((shape) => (
              shape.resistivity === resistivity
              && shape.nodes.some(([x, y]) => (x === i && y === j))))
            ) {
              while (i < canvasData[j].length && canvasData[j][i] === resistivity) {
                i++;
              }
              i--; // the next iteration will increment i by 1
              continue;
            }
            // This checks if the (i, j) node is inside 4 other nodes with the same resistivity
            // if so, we can skip this node
            if ((i > 0 && canvasData[j][i - 1] === resistivity)
              && (j > 0 && canvasData[j - 1][i] === resistivity)
              && (canvasData[j - 1][i - 1] === resistivity)) {
              continue;
            }

            let xTail = i;
            let yTail = j;
            let xHead = i;
            let yHead = j;
            const shape: SubsurfaceShape = {
              resistivity,
              nodes: [[xTail, yTail]]
            };
            let direction = EAST; // right by default
            // Loop until we reach the starting point again (figure is closed)
            let iterationsouter = 0;
            do {
              if (iterationsouter++ > MAX_ITERATIONS) break;
              // NOTE: is this really needed? Yes.
              const xLastTail = xTail;
              const yLastTail = yTail;
              // Our new tail is the last head
              xTail = xHead;
              yTail = yHead;

              // Loop until we found the correct direction to go
              let iterationsinner = 0;
              let foundDirection = false;
              let firstLoop = true;
              do {
                if (iterationsinner++ > MAX_ITERATIONS) break;
                foundDirection = false;
                if (!firstLoop) {
                  direction = (direction + 1) % 4; // next direction
                }
                firstLoop = false;
                const xHeadNew = xTail + (direction === EAST ? 1 : direction === WEST ? -1 : 0);
                const yHeadNew = yTail + (direction === NORTH ? -1 : direction === SOUTH ? 1 : 0);
                if ((xHeadNew < 0 || xHeadNew >= canvasData[j].length)
                  || (yHeadNew < 0 || yHeadNew >= canvasData.length)) {
                  continue;
                }
                xHead = xHeadNew;
                yHead = yHeadNew;
                if (xHead === i && yHead === j) {
                  // we reach the starting point again
                  break;
                }

                // Get the blocks that wrap our connection:
                if (direction === NORTH || direction === SOUTH) {
                  // — o —        — o —
                  // l ↑ r  (or)  l ↓ r   (get left and right values)
                  // — o —        — o —
                  const leftResistivity = canvasData[Math.min(yTail, yHead)][xHead - 1] ?? 0;
                  const rightResistivity = canvasData[Math.min(yTail, yHead)][xHead] ?? 0;
                  // This is the way to go (a boundary is found):
                  if (Number(leftResistivity !== resistivity)
                    + Number(rightResistivity !== resistivity) === 1) {
                    foundDirection = true;
                  }
                } else {
                  // | u |        | u |
                  // o → o  (or)  o ← o   (get up down values)
                  // | d |        | d |
                  const upResistivity = (
                    yHead === 0 ? 0 : canvasData[yHead - 1][Math.min(xTail, xHead)]
                  ) ?? 0;
                  const downResistivity = canvasData[yHead][Math.min(xTail, xHead)] ?? 0;
                  // This is the way to go (a boundary is found):
                  if (+(upResistivity !== resistivity) + +(downResistivity !== resistivity) === 1) {
                    foundDirection = true;
                  }
                }
                // dirección pero repetida     (loop)
                // dirección pero no repetida  (end loop)
                // no direccion, pasamos a la siguiente (loop)
              } while (
                !foundDirection || (foundDirection && (xLastTail === xHead && yLastTail === yHead))
              );

              // At this point, the next node to go is found, so advance and save it
              // (xHead and yHead are already set to the next node)
              shape.nodes.push([xHead, yHead]);
            } while (!(xHead === i && yHead === j));

            shape.nodes.pop(); // remove the last node (it's the same as the first one)
            shapes.push(shape);
          }
        }

        // TODO: Remove this
        // console.log(shapes.map(a => (a.nodes.length)))

        useCanvasStore.setState({
          parsedShapes: shapes
        });
      } else {
        const gridSizePixels = metersToPx(state.gridSizeMeters, state);
        canvasData[cell.x][cell.y] = 0;
        ctx.clearRect(
          cell.x * gridSizePixels,
          cell.y * gridSizePixels,
          gridSizePixels,
          gridSizePixels
        );
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
        onMouseDown={(e) => { if (e.detail > 1) e.preventDefault(); }}
        // Prevent selection on double click: https://stackoverflow.com/q/880512/18114046
      />
    </section>
  );
}
