import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AppcontextProvider } from "../component/zustand.tsx/Appcontext";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppcontextProvider>
      <Head>
        <title>Production monitoring</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/Logo.png" />
      </Head>

      <Component {...pageProps} />
    </AppcontextProvider>
  );
}
