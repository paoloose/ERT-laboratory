import { SubsurfaceShape } from '@/stores/canvasStore';
import { ERTCanvasConfig } from '@/types';

type PolyData = [poly: string, newShapes: SubsurfaceShape[]];

// See the .poly format specification:
// https://www.cs.cmu.edu/~quake/triangle.poly.html
export function canvasDataToPoly(
  shapes: SubsurfaceShape[],
  canvasConfig: ERTCanvasConfig
): PolyData {
  // eslint-disable-next-line no-param-reassign
  shapes = [
    {
      nodes: [
        [0, 0],
        [0, canvasConfig.worldSizeMeters.y / canvasConfig.gridSizeMeters],
        [
          canvasConfig.worldSizeMeters.x / canvasConfig.gridSizeMeters,
          canvasConfig.worldSizeMeters.y / canvasConfig.gridSizeMeters
        ],
        [canvasConfig.worldSizeMeters.x / canvasConfig.gridSizeMeters, 0]
      ],
      resistivity: 150
    },
    ...shapes
  ];
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
  shapes.forEach((shape, i) => {
    if (shape.resistivity === 150) {
      attributes.push([99.99, 49.99, i + 1, 0]);
      return;
    }
    const firstNode = shape.nodes[0];
    // TODO: fix this trick
    attributes.push([firstNode[0] + 0.01, firstNode[1] + 0.01, i + 1, 0]);
  });

  // NOTE: we invert the y axis since the canvas has y=0 at the top

  return [`${vertices.length}\t2\t0\t1
${vertices.map(([x, y], i) => (
    `${i}\t${x * canvasConfig.gridSizeMeters}\t${-y * canvasConfig.gridSizeMeters}\t0`
  )).join('\n')}
${segments.length}\t1
${segments.map(([a, b, marker], i) => (
    `${i}\t${a}\t${b}\t${marker}`
  )).join('\n')}
0
${attributes.length}
${attributes.map(([x, y, attribute, area], i) => (
    `${i}\t${x * canvasConfig.gridSizeMeters}\t${-y * canvasConfig.gridSizeMeters}\t${attribute}.0e+00\t${area}.0e+00`
  )).join('\n')}
`, shapes];
}
