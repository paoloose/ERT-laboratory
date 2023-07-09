import { useEffect, useMemo, useRef } from 'react';
import { debounce } from 'debounce';
import { CANVAS_DATA_LOCAL_STORAGE_ID, canvasConfig, useCanvasStore } from '@/stores/canvasStore';
import styles from '@/styles/ERTOutput.module.scss';
import { canvasDataToPoly } from '@/lib/canvasToPoly';
import { Resistivity } from '@/types';

type RhoMap = Array<[number, Resistivity]>;
type MeshDataResponse = {
  image: string
};

export function ERTInversionOutput() {
  const imageRef = useRef<HTMLImageElement>(null);

  const debounceFetch = useMemo(() => debounce((polyStr: string, rhoMap: RhoMap) => {
    console.log(polyStr);
    console.log(rhoMap);
    fetch(`${import.meta.env.VITE_ERT_BACKEND}/invert`, {
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
      window.localStorage.setItem('thirdTab', data.image);
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
        src={window.localStorage.getItem('thirdTab') ?? ''}
        alt="Loading...."
      />
    </section>
  );
}
