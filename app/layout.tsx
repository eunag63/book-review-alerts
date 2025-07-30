import "./globals.css";

export const metadata = { title: '책 서평단 알림' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">
        <header className="p-6 bg-white shadow">
          <h1 className="text-2xl font-bold text-black">📚 책 서평단 알림</h1>
        </header>
        <main className="max-w-md mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}