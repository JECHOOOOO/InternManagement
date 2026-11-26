import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { InternAppProvider } from "@/context/InternAppContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ashai · Apparel Smart Hub (Intern Demo UI)",
    template: "%s · Ashai Intern Hub",
  },
  description:
    "Responsive mobile-first intern web interface for Ashai Apparel Smart Hub (demo prototype reconstructed from mobile screenshots).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#090c0c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <InternAppProvider>
          <AppShell>{children}</AppShell>
        </InternAppProvider>
      </body>
    </html>
  );
}
