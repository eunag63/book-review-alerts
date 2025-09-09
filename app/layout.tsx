import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <header style={{ backgroundColor: '#0a0a0a' }} className="pl-10 pr-6 py-5">
          <Link href="/" className="block">
            <h1 className="text-white text-2xl font-bold tracking-tight m-0 hover:opacity-80 transition-opacity" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              <span className="text-[#80FD8F]">freebook</span> 책 서평단 모음
            </h1>
          </Link>
        </header>
        
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
        <main className="max-w-md mx-auto p-6 text-white min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>{children}</main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>COPYRIGHT © freebook. All rights reserved.</p>
        </footer>
        
        <Analytics />
      </body>
    </html>
  );
}