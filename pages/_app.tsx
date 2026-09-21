import type { AppProps } from "next/app";
import { Geist, Geist_Mono } from "next/font/google";
import Head from "next/head";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col`}
    >
      <Head>
        <title>OAuth 2.0 GitHub Example</title>
        <meta
          name="description"
          content="Next.js translation of the OAuth.com GitHub OAuth example"
        />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}
