import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-CX9H8TH5EB"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CX9H8TH5EB');
            `,
          }}
        />
      </head>

      <body className="min-h-screen bg-[#0a0a0a]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
