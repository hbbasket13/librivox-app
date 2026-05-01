import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-[#FFFBF5] border-b border-[#E8D7B7] sticky top-0 z-40 backdrop-blur-sm bg-[#FFFBF5]/95">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-[#3D2817] hover:text-[#9A7A2E] transition-colors"
        >
          📚 LibriVox 도서관
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/"
            className="text-[#5C4530] hover:text-[#B8923D] transition-colors"
          >
            전체 도서
          </Link>
          <Link
            href="/library"
            className="text-[#5C4530] hover:text-[#B8923D] transition-colors flex items-center gap-1.5"
          >
            <span>♥</span>
            <span>내 라이브러리</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}