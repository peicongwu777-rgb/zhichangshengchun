import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "./components/ApiKeyForm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "职场生存小游戏",
  description: "职场生存小游戏 - DeepSeek / 火山引擎驱动",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ApiKeyProvider>
          {children}
        </ApiKeyProvider>
      </body>
    </html>
  );
}
