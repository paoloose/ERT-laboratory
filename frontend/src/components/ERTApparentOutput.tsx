import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'debounce';
import styles from '@/styles/ERTOutput.module.scss';
import { Resistivity } from '@/types';
import { canvasDataToPoly } from '@/lib/canvasToPoly';
import { CANVAS_DATA_LOCAL_STORAGE_ID, canvasConfig, useCanvasStore } from '@/stores/canvasStore';

type RhoMap = Array<[number, Resistivity]>;
type MeshDataResponse = {
  image: string
};

export function ERTApparentOutput() {
  const imageRef = useRef<HTMLImageElement>(null);

  const debounceFetch = useMemo(() => debounce((polyStr: string, rhoMap: RhoMap) => {
    console.log(polyStr);
    console.log(rhoMap);
    fetch('http://127.0.0.1:5000/apparent', {
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
      window.localStorage.setItem('secondTab', data.image);
    }).catch(() => 'backend is overloaded please be gentle')
      .finally(() => {
        window.localStorage.setItem(
          CANVAS_DATA_LOCAL_STORAGE_ID,
          JSON.stringify(useCanvasStore.getState().canvasData)
        );
      });
  }, 500), []);

  useEffect(() => {
    const { parsedShapes } = useCanvasStore.getState();
    console.log({ parsedShapes });

    const [polyStr, shapes] = canvasDataToPoly(parsedShapes, canvasConfig);
    const rhoMap: RhoMap = shapes.map((shape, i) => [i + 1, shape.resistivity]);
    debounceFetch(polyStr, rhoMap);
  }, [debounceFetch]);

  useCanvasStore.subscribe((store) => {
    const { parsedShapes } = store;

    const [polyStr, shapes] = canvasDataToPoly(parsedShapes, canvasConfig);
    const rhoMap: RhoMap = shapes.map((shape, i) => [i + 1, shape.resistivity]);
    debounceFetch(polyStr, rhoMap);
  });

  return (
    <section className={styles.output}>
      <img
        ref={imageRef}
        src={window.localStorage.getItem('secondTab') ?? ''}
        alt="Loading..."
      />
    </section>
  );
}
