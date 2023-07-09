import { ERTDrawingCanvas } from '@/components/ERTDrawingCanvas';
import { ERTOutput } from '@/components/ERTOutput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import styles from '@/styles/App.module.scss';
import { ERTCanvas } from '@/types';

const canvasInitialState: ERTCanvas = {
  isDragging: false,
  canvasDimensions: { x: 400, y: 200 },
  worldSizeMeters: { x: 100, y: 50 }, // 50mx100m
  gridSizeMeters: 1.0, // 1m
  lastMouse: { x: 0, y: 0 }
};

function App() {
  return (
    <>
      <Header />
      <div className={styles.appContainer}>
        <Sidebar />
        <main className={styles.mainWrapper}>
          <ERTDrawingCanvas initialState={canvasInitialState} />
          <div>
            <ERTOutput />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
