'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/');
    }
  };

  const handleClear = () => {
    setQuery('');
    router.push('/');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-12">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목, 작가, 키워드 검색 (예: Sherlock, Doyle, mystery)"
          className="w-full px-5 py-3 pr-24 bg-[#FFFBF5] border-2 border-[#E8D7B7] rounded-lg text-[#3D2817] placeholder-[#A89072] focus:outline-none focus:border-[#B8923D] transition-colors shadow-[0_2px_8px_rgba(120,80,40,0.06)]"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-20 top-1/2 -translate-y-1/2 text-[#A89072] hover:text-[#3D2817] transition-colors"
            aria-label="지우기"
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md text-sm font-medium transition-colors"
        >
          검색
        </button>
      </div>
    </form>
  );
}