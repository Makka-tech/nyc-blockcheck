import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: { default: "NYC BlockCheck", template: "%s · NYC BlockCheck" },
  description:
    "Source-backed building and block reports for New York City renters and residents.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteHeader />
        {children}
        <footer className="mx-auto mt-16 max-w-6xl border-t border-slate-200 px-5 py-8 text-sm text-slate-500 dark:border-slate-800">
          <p>
            NYC BlockCheck is an independent civic-tech project. It reports
            public records and does not assess whether a place is safe or
            unsafe.
          </p>
        </footer>
      </body>
    </html>
  );
}
