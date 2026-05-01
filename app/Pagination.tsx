import Link from 'next/link';

type Props = {
  currentPage: number;
  hasNext: boolean;
  query?: string;
};

function buildHref(page: number, query?: string) {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export default function Pagination({ currentPage, hasNext, query }: Props) {
  const hasPrev = currentPage > 1;

  return (
    <div className="flex items-center justify-center gap-4 mt-12">
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1, query)}
          className="px-5 py-2 bg-[#FFFBF5] border border-[#E8D7B7] text-[#3D2817] rounded-md hover:border-[#B8923D] hover:bg-[#FFF4DC] transition-colors text-sm font-medium"
        >
          ← 이전
        </Link>
      ) : (
        <span className="px-5 py-2 border border-[#E8D7B7] text-[#D4C5A0] rounded-md text-sm cursor-not-allowed">
          ← 이전
        </span>
      )}

      <span className="font-serif text-[#3D2817] px-4">
        {currentPage} 페이지
      </span>

      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1, query)}
          className="px-5 py-2 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md transition-colors text-sm font-medium"
        >
          다음 →
        </Link>
      ) : (
        <span className="px-5 py-2 border border-[#E8D7B7] text-[#D4C5A0] rounded-md text-sm cursor-not-allowed">
          다음 →
        </span>
      )}
    </div>
  );
}