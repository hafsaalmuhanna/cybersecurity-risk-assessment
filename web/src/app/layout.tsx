import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "CyberFaris — سايبر فارس",
  description: "أول مدرسة افتراضية عالمية تُخرِّج فرسان الأمن السيبراني. The first global virtual school forging cyber knights.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" data-theme="dark" suppressHydrationWarning>
      <body dir="rtl">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
