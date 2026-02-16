import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trainer Dashboard",
  description: "Manage your clients and fitness programs",
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
