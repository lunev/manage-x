import { Link } from 'react-router-dom';
import { APP_NAME } from '@/constants';
import logo from '@/assets/logo.png';
import SettingsIcon from '@/components/ui/icons/SettingsIcon';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src={logo} width="20" height="20" alt={`${APP_NAME} logo`} />
        <Link to="/" className={styles.headline}>
          {APP_NAME}
        </Link>
      </div>
      <Link
        to="/preferences/"
        data-testid="preferences"
        title="Preferences"
        aria-label="Preferences"
      >
        <SettingsIcon />
      </Link>
    </header>
  );
};

export default Header;
