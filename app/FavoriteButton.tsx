'use client';

import { useEffect, useState } from 'react';
import { isFavorite, toggleFavorite, FavoriteBook } from './lib/favorites';

type Props = {
  book: Omit<FavoriteBook, 'savedAt'>;
  size?: 'sm' | 'lg';
};

export default function FavoriteButton({ book, size = 'sm' }: Props) {
  const [favorited, setFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서 마운트된 후에만 상태 읽기 (서버/클라이언트 일치)
  useEffect(() => {
    setMounted(true);
    setFavorited(isFavorite(book.id));

    // 다른 곳에서 즐겨찾기가 바뀌면 이 버튼도 업데이트
    const handler = () => setFavorited(isFavorite(book.id));
    window.addEventListener('favorites-changed', handler);
    return () => window.removeEventListener('favorites-changed', handler);
  }, [book.id]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();
    const newState = toggleFavorite(book);
    setFavorited(newState);
  };

  if (!mounted) {
    // hydration mismatch 방지: 서버 렌더링 시엔 빈 자리만
    return <div className={size === 'lg' ? 'w-12 h-12' : 'w-8 h-8'} />;
  }

  if (size === 'lg') {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-md font-medium text-sm transition-all ${
          favorited
            ? 'bg-[#B8923D] text-white hover:bg-[#9A7A2E]'
            : 'bg-[#FFFBF5] text-[#3D2817] border border-[#E8D7B7] hover:border-[#B8923D]'
        }`}
        aria-label={favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
      >
        <span className="text-lg">{favorited ? '♥' : '♡'}</span>
        <span>{favorited ? '저장됨' : '즐겨찾기'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
        favorited
          ? 'bg-[#B8923D] text-white shadow-md'
          : 'bg-black/30 text-white hover:bg-black/50'
      }`}
      aria-label={favorited ? '즐겨찾기 해제' : '즐겨찾기 추가'}
    >
      <span className="text-lg leading-none">{favorited ? '♥' : '♡'}</span>
    </button>
  );
}