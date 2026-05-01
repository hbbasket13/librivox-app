'use client';

import { useState } from 'react';

type Props = {
  src: string | null;
  title: string;
  className?: string;
};

export default function BookCover({ src, title, className = '' }: Props) {
  const [error, setError] = useState(false);

  // 표지 URL이 없거나 로드 실패 → 책 제목이 박힌 fallback
  if (!src || error) {
    return (
      <div
        className={`bg-gradient-to-br from-[#8B6F47] via-[#6B4F2F] to-[#3D2817] flex items-center justify-center p-4 ${className}`}
      >
        <span className="font-serif text-[#F5EFE6] text-center leading-tight line-clamp-5 drop-shadow-md">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${title} 표지`}
      className={`object-cover ${className}`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}