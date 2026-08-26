import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '第四季整合績效監控表',
  description: '第四季基金、保險責任目標與真實績效資料監控儀表板',
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
