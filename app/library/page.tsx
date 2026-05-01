'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import BookCover from '../BookCover';
import FavoriteButton from '../FavoriteButton';
import ProgressBar from '../ProgressBar';
import { getFavorites, FavoriteBook } from '../lib/favorites';

export default function LibraryPage() {
  const [favorites, setFavorites] = useState<FavoriteBook[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavorites(getFavorites());

    const handler = () => setFavorites(getFavorites());
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, []);

  return (
    <main className="min-h-screen bg-[#F5EFE6]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-bold text-[#3D2817] mb-3">
            내 라이브러리
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#B8923D]"></div>
            <span className="text-[#8B6F47] text-xs tracking-[0.3em] uppercase">
              My Collection
            </span>
            <div className="h-px w-16 bg-[#B8923D]"></div>
          </div>
          {mounted && favorites.length > 0 && (
            <p className="text-[#8B6F47] mt-4 italic">
              저장된 책 {favorites.length}권
            </p>
          )}
        </header>

        {!mounted ? (
          <div className="text-center py-20 text-[#A89072]">
            불러오는 중...
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[#3D2817] mb-3">
              📭 아직 저장한 책이 없어요
            </p>
            <p className="text-[#8B6F47] mb-6">
              마음에 드는 책의 ♡ 버튼을 눌러 라이브러리에 추가해보세요.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md text-sm font-medium transition-colors"
            >
              도서관 둘러보기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {favorites.map((book) => (
              <Link
                href={`/books/${book.id}`}
                key={book.id}
                className="group relative bg-[#FFFBF5] rounded-lg overflow-hidden border border-[#E8D7B7] shadow-[0_4px_12px_rgba(120,80,40,0.08)] hover:shadow-[0_12px_28px_rgba(120,80,40,0.22)] hover:-translate-y-1 hover:border-[#B8923D] transition-all duration-300"
              >
                <div className="relative">
                  <BookCover
                    src={book.coverUrl}
                    title={book.title}
                    className="aspect-[2/3] w-full"
                  />
                  <FavoriteButton book={book} />
                  <ProgressBar bookId={book.id} />
                </div>
                <div className="p-4">
                  <h2 className="font-serif text-base font-semibold text-[#3D2817] mb-1 line-clamp-2 group-hover:text-[#9A7A2E] transition-colors leading-snug">
                    {book.title}
                  </h2>
                  <p className="text-xs text-[#8B6F47] italic mb-2 line-clamp-1">
                    {book.authors}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-[#A89072] pt-2 border-t border-[#E8D7B7]">
                    <span>⏱ {book.totaltime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}