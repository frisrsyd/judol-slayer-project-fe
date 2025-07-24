import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/partials/Footer";
import * as React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function MainLayout({
  children,
  title = "Judol Slayer",
  description = "Judol Slayer UI Project improvement",
}: MainLayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="google-site-verification"
          content="eDhx04SCQ6SH_tjtQfb41rHqo3RtbBsY2YMfyyRvuSU"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <SpeedInsights />
        <main className={styles.main}>{children}</main>
        <Footer />
      </div>
    </>
  );
}
