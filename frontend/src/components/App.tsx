import { ERTDrawingCanvas } from '@/components/ERTDrawingCanvas';
import { ERTOutput } from '@/components/ERTOutput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { canvasConfig } from '@/stores/canvasStore';
import styles from '@/styles/App.module.scss';

function App() {
  return (
    <>
      <Header />
      <div className={styles.appContainer}>
        <Sidebar />
        <main className={styles.mainWrapper}>
          <ERTDrawingCanvas initialState={canvasConfig} />
          <div>
            <ERTOutput />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
