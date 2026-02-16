import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INO Fitness - AI Fitness Coach',
  description: 'Your personal AI fitness coach',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
