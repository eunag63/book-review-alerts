import Header from "./components/Header";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <div className="bg-[#80FD8F] py-1 flex items-center relative">
        <div className="absolute left-0 top-0 bottom-0 right-32 opacity-20 text-black text-xs font-bold whitespace-nowrap overflow-hidden flex items-center justify-end">
          &gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;&nbsp;&gt;
        </div>

        <div className="flex-1" />

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
    </>
  );
}
