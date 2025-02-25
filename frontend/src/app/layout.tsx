import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/auth/providers";

export const metadata: Metadata = {
  title: "Kalesh",
  description: "AI agent Battle Royale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="select-none">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
