import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'debounce';
import styles from '@/styles/ERTOutput.module.scss';
import { polyparse } from '@/lib/polyParse';
import { getCanvasContext2D } from '@/utils/canvas';
import { SubsurfaceShape, useCanvasStore } from '@/stores/canvasStore';
import { Resistivity, Vec2Pair } from '@/types';

const scale = (points: Vec2Pair[], sx: number, sy: number) => {
  if (!points) return;

  for (let i = 0; i < points.length; i++) {
    // eslint-disable-next-line no-param-reassign
    points[i][0] *= sx;
    // eslint-disable-next-line no-param-reassign
    points[i][1] *= sy;
  }
};

const draw = (ctx: CanvasRenderingContext2D, data: ReturnType<typeof polyparse>) => {
  const points = data?.pointlist;
  const segments = data?.segmentlist;
  const holes = data?.holelist;
  console.log({ points, segments, holes });

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

// See the .poly format specification:
// https://www.cs.cmu.edu/~quake/triangle.poly.html
function canvasDataToPoly(shapes: SubsurfaceShape[]) {
  // First line:
  // <# of vertices> <dimension (must be 2)> <# of attributes> <# of boundary markers (0 or 1)>
  // Following lines:
  // <vertex #> <x> <y> [attributes] [boundary marker]
  const vertices = shapes.flatMap((shape) => shape.nodes);

  // One line:
  // <# of segments> <# of boundary markers (0 or 1)>
  // Following lines:
  // <segment #> <endpoint> <endpoint> [boundary marker]
  const segments: Array<[number, number, number]> = [] as any;
  let shapeIndex = 0;
  let nodeIndex = 0;
  let tailNode = 0;
  for (let i = 0; i < vertices.length; i++) {
    if (nodeIndex++ === shapes[shapeIndex].nodes.length - 1) {
      segments.push([i, tailNode, shapeIndex]);
      tailNode = i + 1;
      nodeIndex = 0;
      shapeIndex += 1;
      continue;
    }
    segments.push([i, i + 1, shapeIndex]);
  }

  // One line: <# of holes>
  // (holes are empty for PyGIMLi)

  // Optional line:
  // <# of regional attributes and/or area constraints>
  // Optional following lines:
  // <region #> <x> <y> <attribute> <maximum area></maximum>
  const attributes: Array<[number, number, number, number]> = [] as any;
  shapes.forEach((nodes, i) => {
    const firstNode = nodes.nodes[0];
    attributes.push([firstNode[0] + 0.01, firstNode[1] + 0.01, i + 1, 0]);
  });

  // NOTE: we invert the y axis since the canvas has y=0 at the top

  return `${vertices.length}\t2\t0\t1
${vertices.map(([x, y], i) => (
    `${i}\t${x}\t${-y}\t0`
  )).join('\n')}
${segments.length}\t1
${segments.map(([a, b, marker], i) => (
    `${i}\t${a}\t${b}\t${marker}`
  )).join('\n')}
0
${attributes.length}
${attributes.map(([x, y, attribute, area], i) => (
    `${i}\t${x}\t${-y}\t${attribute}\t${area}`
  )).join('\n')}
`;
}

type RhoMap = Array<[number, Resistivity]>;
type MeshDataResponse = {
  image: string
};

export function ERTOutput() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = getCanvasContext2D(canvasRef.current);
    if (!ctx) return;
    ctx.canvas.width = 360;
    ctx.canvas.height = 320;
    // loadPoly(ctx, 'https://brunoimbrizi.github.io/poly-parse/demo/assets/A.poly');
  }, []);

  const debounceFetch = useMemo(() => debounce((polyStr: string, rhoMap: RhoMap) => {
    console.log('fetching');
    fetch('http://127.0.0.1:5000/render', {
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
    });
  }, 500), []);

  useCanvasStore.subscribe((store) => {
    // const ctx = getCanvasContext2D(canvasRef.current);
    // if (!ctx) return;

    const { parsedShapes } = store;
    const polyStr = canvasDataToPoly(parsedShapes);
    const rhoMap: RhoMap = parsedShapes.map((shape, i) => [i + 1, shape.resistivity]);

    // draw(ctx, polyparse(polyStr));
    // fetchMesh(polyStr, rhoMap).then
    console.log('suscribing fired');
    console.log(polyStr);
    debounceFetch(polyStr, rhoMap);
  });

  return (
    <section className={styles.output}>
      {/* <img
        src="https://www2.geo.uni-bonn.de/~wagner/pg/_images/sphx_glr_plot_01_ert_2d_mod_inv_thumb.png"
        alt=""
      /> */}
      {/* <canvas ref={canvasRef} /> */}
      <img
        ref={imageRef}
        src=""
        alt="ERT inver"
      />
    </section>
  );
}
