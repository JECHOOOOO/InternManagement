import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { InternAppProvider } from "@/context/InternAppContext";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-ashai",
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
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="font-sans antialiased">
        <InternAppProvider>
          <AppShell>{children}</AppShell>
        </InternAppProvider>
      </body>
    </html>
  );
}
