import { useDrawingStore } from '@/stores/drawingStore';
import styles from '@/styles/Sidebar.module.scss';
import { getColorFromResistivity } from '@/utils/colorMaps';

export function Sidebar() {
  const drawing = useDrawingStore();

  return (
    <aside className={styles.sidebar}>
      <section>
        Ver grid
        <input id="show-grid" type="checkbox" />
      </section>
      <section className={styles.tools}>
        {
          drawing.tools.map((tool) => (
            <button
              type="button"
              key={tool.name}
              onClick={() => drawing.setTool(tool.name)}
              style={{ outline: tool === drawing.selected_tool ? '2px solid #30406b' : undefined }}
            >
              {tool.icon}
              {' '}
              {tool.name}
            </button>
          ))
        }
      </section>
      <section className={styles.resitivities}>
        <h4>Resistividades</h4>
        <ul>
          {
            drawing.resistivities.map((resistivity) => (
              <li key={resistivity.value}>
                <button
                  type="button"
                  onClick={() => drawing.setResistivity(resistivity)}
                  style={{ outline: resistivity.value === drawing.selected_resistivity.value ? '2px solid #30406b' : undefined }}
                >
                  <div
                    style={{ backgroundColor: getColorFromResistivity(resistivity.value) }}
                  />
                  <span className={styles.resistivityValue}>
                    {resistivity.value}
                  </span>
                  <span className={styles.resistivityName}>
                    {resistivity.name}
                  </span>
                </button>
              </li>
            ))
          }
        </ul>
      </section>
    </aside>
  );
}

// Colors reverse engineering:
// https://github.com/matplotlib/matplotlib/blob/e05158371bea16e1c40d50c51b4e8dff917b7bf7/lib/matplotlib/_cm.py#L793-L805C6
