import type { Metadata } from "next";
import { SITE_TITLE, SITE_SUBTITLE } from "@/lib/constants";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE_TITLE} — ${SITE_SUBTITLE}`,
  description: "与郦道元对话，探索《水经注》中的中国古代地理世界。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
