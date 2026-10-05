import { Outlet } from "react-router-dom";
import { Header } from "@/widgets/header";
import styles from "./BaseLayout.module.scss";

export const BaseLayout = () => (
  <div className={styles.layout}>
    <Header />
    <main className={styles.content}>
      <div className={`container ${styles.container}`}>
        <Outlet />
      </div>
    </main>
  </div>
);
