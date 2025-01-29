import styles from './Switch.module.css';

interface BaseSwitchProps {
  id?: string;
  className?: string;
  label?: string;
  checked: boolean;
  hint?: string;
  onChange: () => void;
}

const BaseSwitch: React.FC<BaseSwitchProps> = ({
  className = '',
  label,
  checked,
  hint,
  onChange,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === 'Space') {
      event.preventDefault();
      onChange();
    }
  };

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.switch}>
        {label && <span className={styles.title}>{label}</span>}
        <label className={styles.label}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={checked}
            name={label}
            aria-label={label}
            onChange={onChange}
          />
          <div
            className={styles.bar}
            role="button"
            tabIndex={0}
            aria-label={label}
            onKeyDown={handleKeyPress}
          >
            <span className={styles.dot}></span>
          </div>
        </label>
      </div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
};

export default BaseSwitch;
