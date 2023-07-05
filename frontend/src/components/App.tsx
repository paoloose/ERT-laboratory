import { ERTCanvas } from '@/components/ERTCanvas';
import { ERTOutput } from '@/components/ERTOutput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import styles from '@/styles/App.module.scss';

const canvasState: ERTCanvas = {
  isDragging: false,
  world_size: { x: 420, y: 340 },
  grid: { x: 42, y: 34 },
  last_mouse: { x: 0, y: 0 },
  pixe_size: 10
};

function App() {
  return (
    <>
      <Header />
      <div className={styles.appContainer}>
        <Sidebar />
        <main className={styles.mainWrapper}>
          <ERTCanvas initialState={canvasState} />
          <div>
            <ERTOutput />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
