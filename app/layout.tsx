import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hearing — Connected care",
  description: "One connected workspace for hearing care, patients, repairs and supply partners.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
