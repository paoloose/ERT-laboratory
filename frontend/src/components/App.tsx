import { Route } from 'wouter';
import { ERTDrawingCanvas } from '@/components/ERTDrawingCanvas';
import { ERTOutput } from '@/components/ERTOutput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { canvasConfig } from '@/stores/canvasStore';
import { TabNavigator } from './TabNavigator';
import styles from '@/styles/App.module.scss';

function App() {
  return (
    <>
      <Header />
      <div className={styles.appContainer}>
        <Sidebar />
        <main className={styles.mainWrapper}>
          <TabNavigator />
          <div className={styles.mainContent}>
            <Route path="/">
              <ERTDrawingCanvas initialState={canvasConfig} />
              <div>
                <ERTOutput />
              </div>
            </Route>
            <Route path="/inversion">
              <div>
                Inversion
              </div>
            </Route>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
