import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import dynamic from "next/dynamic";

const Test = dynamic(() => import("./DashBoard1"), { ssr: false });

export default function Home() {
  return (
    <div className={styles.container}>
      <Test />
    </div>
  );
}
