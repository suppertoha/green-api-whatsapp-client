import styles from "./Header.module.scss";

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.brandAccent}>GREEN-API</span>
          <span className={styles.brandSuffix}>MAX</span>
        </div>
        <p className={styles.tagline}>WhatsApp Web Client</p>
      </div>
    </header>
  );
};
