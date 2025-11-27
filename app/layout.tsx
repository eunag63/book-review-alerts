import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Header from "./components/Header";
import RegisterButton from "./components/RegisterButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
        <Header />
        
        {/* 서평단 등록하기 버튼 (앱에서는 숨김) */}
        <RegisterButton />
        <main className="max-w-md mx-auto p-6 text-white min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>{children}</main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>COPYRIGHT © freebook. All rights reserved.</p>
        </footer>
        
        <Analytics />
      </body>
    </html>
  );
}