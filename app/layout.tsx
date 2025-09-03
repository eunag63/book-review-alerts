import "./globals.css";

export const metadata = { title: '프리북 - 책 서평단 모음' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-black pl-10 pr-6 py-5 border-b-4 border-[#80FD8F]">
          <h1 className="text-white text-2xl font-bold tracking-tight m-0" style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            <span className="text-[#80FD8F]">freebook</span> 책 서평단 모음
          </h1>
        </header>
        <main className="max-w-md mx-auto p-6">{children}</main>
        <footer className="text-center p-4 text-gray-500 text-sm">
          <p>COPYRIGHT © freebook. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}