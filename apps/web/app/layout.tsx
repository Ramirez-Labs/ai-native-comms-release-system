import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Comms Release Gate",
  description: "AI-native comms release governance + routing system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-base-200 text-base-content">{children}</body>
    </html>
  );
}
