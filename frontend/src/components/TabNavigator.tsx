import { Link } from 'wouter';
import styles from '@/styles/TabNavigator.module.scss';

export function TabNavigator() {
  return (
    <ul className={styles.navigatorBar}>
      <li>
        <Link href="/">
          <a href="#">Creación de Mesh</a>
        </Link>
      </li>
      <li>
        <Link href="/inversion">
          <a>Resistividades aparentes</a>
        </Link>
      </li>
      <li>
        <Link href="/inversion">
          <a>Inversión de datos</a>
        </Link>
      </li>
    </ul>
  );
}
