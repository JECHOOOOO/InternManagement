import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { InternAppProvider } from "@/context/InternAppContext";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

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
    <html lang="en" className={roboto.variable}>
      <body className="font-sans antialiased">
        <InternAppProvider>
          <AppShell>{children}</AppShell>
        </InternAppProvider>
      </body>
    </html>
  );
}
