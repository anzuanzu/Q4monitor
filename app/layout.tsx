import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '第四季基金專案｜績效監控表',
  description: '第四季基金專案責任目標監控儀表板',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
