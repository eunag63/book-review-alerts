import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','GTM-N5TTMTF6');`,
          }}
        />
      </head>
      <body className="min-h-screen" style={{ backgroundColor: "#0a0a0a" }}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N5TTMTF6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Header />

        {/* 녹색 구역에 서평단 등록하기 */}
        <div className="bg-[#80FD8F] py-1 flex items-center relative">
          <div className="absolute left-0 top-0 bottom-0 right-32 opacity-20 text-black text-xs font-bold whitespace-nowrap overflow-hidden flex items-center justify-end">
            &gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;
          </div>
          <div className="flex-1"></div>
          <a
            href="/register"
            className="text-black font-medium hover:text-gray-700 transition-colors text-sm whitespace-nowrap mr-6"
          >
            서평단 등록하기
          </a>
        </div>
        <main
          className="max-w-md mx-auto p-6 text-white min-h-screen"
          style={{ backgroundColor: "#0a0a0a" }}
        >
          {children}
        </main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>COPYRIGHT © freebook. All rights reserved.</p>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
