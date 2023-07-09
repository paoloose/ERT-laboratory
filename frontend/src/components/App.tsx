import { Route } from 'wouter';
import { ERTDrawingCanvas } from '@/components/ERTDrawingCanvas';
import { ERTMeshOutput } from '@/components/ERTMeshOutput';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { canvasConfig } from '@/stores/canvasStore';
import styles from '@/styles/App.module.scss';
import { TabNavigator } from '@/components/TabNavigator';
import { ERTApparentOutput } from '@/components/ERTApparentOutput';
import { ERTInversionOutput } from '@/components/ERTInversionOutput';

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
                <ERTMeshOutput />
              </div>
            </Route>
            <Route path="/aparentes">
              <ERTDrawingCanvas initialState={canvasConfig} />
              <div>
                <ERTApparentOutput />
              </div>
            </Route>
            <Route path="/inversion">
              <ERTDrawingCanvas initialState={canvasConfig} />
              <div>
                <ERTInversionOutput />
              </div>
            </Route>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
