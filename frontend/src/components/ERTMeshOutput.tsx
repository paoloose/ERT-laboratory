import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'debounce';
import styles from '@/styles/ERTOutput.module.scss';
import { polyparse } from '@/lib/polyParse';
import { getCanvasContext2D } from '@/utils/canvas';
import { Resistivity, Vec2Pair } from '@/types';
import { canvasDataToPoly } from '@/lib/canvasToPoly';
import { CANVAS_DATA_LOCAL_STORAGE_ID, canvasConfig, useCanvasStore } from '@/stores/canvasStore';

const scale = (points: Vec2Pair[], sx: number, sy: number) => {
  if (!points) return;

  for (let i = 0; i < points.length; i++) {
    // eslint-disable-next-line no-param-reassign
    points[i][0] *= sx;
    // eslint-disable-next-line no-param-reassign
    points[i][1] *= sy;
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const draw = (ctx: CanvasRenderingContext2D, data: ReturnType<typeof polyparse>) => {
  const points = data?.pointlist;
  const segments = data?.segmentlist;
  const holes = data?.holelist;

  if (!points || !segments || !holes) return;

  const outerPoints = {
    minX: points[0][0],
    maxX: points[0][0],
    minY: points[0][1],
    maxY: points[0][1]
  };

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    outerPoints.minX = Math.min(outerPoints.minX, x);
    outerPoints.maxX = Math.max(outerPoints.maxX, x);
    // y is inverted
    outerPoints.minY = Math.max(outerPoints.minY, y);
    outerPoints.maxY = Math.min(outerPoints.maxY, y);
  }

  // move whole poly to (0, 0)
  for (let i = 0; i < points.length; i++) {
    points[i][0] -= outerPoints.minX;
    points[i][1] -= outerPoints.minY;
  }
  for (let i = 0; i < holes.length; i++) {
    holes[i][0] -= outerPoints.minX;
    holes[i][1] -= outerPoints.minY;
  }

  const scaleRatio = {
    x: ctx.canvas.width / (outerPoints.maxX - outerPoints.minX),
    y: ctx.canvas.height / (outerPoints.maxY - outerPoints.minY)
  };

  scale(points, scaleRatio.x, scaleRatio.y);
  scale(holes, scaleRatio.x, scaleRatio.y);

  ctx.save();
  ctx.fillStyle = '#eee';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = '#000';
  ctx.lineWidth = 2;

  // draw points
  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i];
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // draw segments
  for (let i = 0; i < segments.length; i++) {
    const [a, b] = segments[i];
    ctx.beginPath();
    ctx.moveTo(points[a][0], points[a][1]);
    ctx.lineTo(points[b][0], points[b][1]);
    ctx.stroke();
  }

  // draw holes
  ctx.fillStyle = 'red';
  for (let i = 0; i < holes.length; i++) {
    const [x, y] = holes[i];

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI * -0.25);
    ctx.fillRect(-1, -6, 2, 12);
    ctx.rotate(Math.PI * 0.5);
    ctx.fillRect(-1, -6, 2, 12);
    ctx.restore();
  }

  ctx.restore();
};

type RhoMap = Array<[number, Resistivity]>;
type MeshDataResponse = {
  image: string
};

export function ERTMeshOutput() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const debounceFetch = useMemo(() => debounce((polyStr: string, rhoMap: RhoMap) => {
    console.log(polyStr, JSON.stringify(rhoMap));
    fetch(`${import.meta.env.VITE_ERT_BACKEND}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        poly_file_str: polyStr,
        rhomap: rhoMap
      })
    }).then((response) => response.json()).then((data: MeshDataResponse) => {
      imageRef.current!.src = data.image;
      window.localStorage.setItem('firstTab', data.image);
    }).catch(() => 'backend is overloaded please be gentle')
      .finally(() => {
        window.localStorage.setItem(
          CANVAS_DATA_LOCAL_STORAGE_ID,
          JSON.stringify(useCanvasStore.getState().canvasData)
        );
      });
  }, 500), []);

  useEffect(() => {
    const ctx = getCanvasContext2D(canvasRef.current);
    if (!ctx) return;
    ctx.canvas.width = 800;
    ctx.canvas.height = 400;
    ctx.canvas.style.width = '500px';
    ctx.canvas.style.height = '250px';

    const { parsedShapes } = useCanvasStore.getState();

    const [polyStr, shapes] = canvasDataToPoly(parsedShapes, canvasConfig);
    const rhoMap: RhoMap = shapes.map((shape, i) => [i + 1, shape.resistivity]);
    draw(ctx, polyparse(polyStr));
    debounceFetch(polyStr, rhoMap);
  }, [debounceFetch]);

  useCanvasStore.subscribe((store) => {
    const ctx = getCanvasContext2D(canvasRef.current);
    if (!ctx) return;

    const { parsedShapes } = store;

    const [polyStr, shapes] = canvasDataToPoly(parsedShapes, canvasConfig);
    const rhoMap: RhoMap = shapes.map((shape, i) => [i + 1, shape.resistivity]);
    draw(ctx, polyparse(polyStr));
    debounceFetch(polyStr, rhoMap);
  });

  return (
    <section className={styles.output}>
      <canvas ref={canvasRef} />
      <img
        ref={imageRef}
        src={window.localStorage.getItem('firstTab') ?? ''}
        alt="Comienza a dibujar la subsuperficie!"
      />
    </section>
  );
}
