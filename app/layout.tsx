import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "共讀遠征｜愛與和平",
  description: "十月共同閱讀計畫：每天讀一點，一起向音樂會前進。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
