import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AppShell } from '@/components/AppShell';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Faianaya Coffee - Sistem Manajemen Kedai Kopi',
  description: 'Open Source Coffee Shop Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans neumorphic-bg min-h-screen`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}