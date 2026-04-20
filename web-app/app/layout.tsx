import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'INÖ Platform — Coaching software for fitness pros',
  description: 'Built for coaches who care about their clients. Workout builder, form video review, automation, client risk flags. $129/mo.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
