import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LoadingBar } from "@/components/LoadingBar";
import { SyntaxHighlightStyle } from "@/components/SyntaxHighlightStyle";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: {
    default: "hugdochi",
    template: "%s | hugdochi"
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* UI·제목: Wanted Sans / 본문: 마루 부리 (@font-face는 globals.css에 정의) */}
        <link rel="stylesheet" as="style" crossOrigin="anonymous" href="https://cdn.jsdelivr.net/gh/wanteddev/wanted-sans@v1.0.3/packages/wanted-sans/fonts/webfonts/variable/split/WantedSansVariable.min.css" />
        <link rel="preconnect" href="https://hangeul.pstatic.net" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SyntaxHighlightStyle />
          <Suspense fallback={null}>
            <LoadingBar />
          </Suspense>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
