import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeRepo | Turn any repo into a vibe",
  description: "Generate an agent-ready coding package from any public GitHub repository.",
  icons: { icon: "/viberepo-mark.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
