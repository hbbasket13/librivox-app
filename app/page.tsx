import Link from 'next/link';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import BookCover from './BookCover';
import FavoriteButton from './FavoriteButton';
import ProgressBar from './ProgressBar';
import { getCoverUrl } from './lib/librivox';
import { searchBooks } from './lib/catalog';

const PAGE_SIZE = 12;

function authorString(
  authors?: Array<{ first_name: string; last_name: string }>
): string {
  return (
    authors?.map((a) => `${a.first_name} ${a.last_name}`).join(', ') ||
    '저자 미상'
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() || '';
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  let books: Awaited<ReturnType<typeof searchBooks>>['books'] = [];
  let hasNext = false;
  let total = 0;
  let error = false;

  try {
    const result = await searchBooks(query, page, PAGE_SIZE);
    books = result.books;
    hasNext = result.hasNext;
    total = result.total;
  } catch {
    error = true;
  }

  return (
    <main className="min-h-screen bg-[#F5EFE6]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-10 text-center">
          <h1 className="font-serif text-5xl font-bold text-[#3D2817] mb-3">
            LibriVox 도서관
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#B8923D]"></div>
            <span className="text-[#8B6F47] text-xs tracking-[0.3em] uppercase">
              {total > 0 && !query ? `${total.toLocaleString()} Audiobooks` : 'Free Audiobooks'}
            </span>
            <div className="h-px w-16 bg-[#B8923D]"></div>
          </div>
        </header>

        <SearchBar />

        {query && !error && books.length > 0 && (
          <p className="text-center text-[#8B6F47] mb-8 italic">
            <span className="text-[#B8923D] font-semibold">'{query}'</span>{' '}
            검색 결과 {total.toLocaleString()}권
          </p>
        )}

        {error ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[#3D2817] mb-3">
              📚 도서관이 잠시 문을 닫았어요
            </p>
            <p className="text-[#8B6F47] mb-6">
              일시적으로 책 목록을 불러올 수 없어요.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md text-sm font-medium transition-colors"
            >
              다시 시도하기
            </Link>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-2xl text-[#3D2817] mb-3">
              📭 검색 결과가 없어요
            </p>
            <p className="text-[#8B6F47]">
              다른 단어로 시도해보세요. 제목, 작가, 설명에서 모두 검색됩니다.
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-5 py-2 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md text-sm font-medium transition-colors"
            >
              전체 도서관 보기
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {books.map((book) => {
                const coverUrl = getCoverUrl(book.url_zip_file, book.id);
                return (
                  <Link
                    href={`/books/${book.id}`}
                    key={book.id}
                    className="group relative bg-[#FFFBF5] rounded-lg overflow-hidden border border-[#E8D7B7] shadow-[0_4px_12px_rgba(120,80,40,0.08)] hover:shadow-[0_12px_28px_rgba(120,80,40,0.22)] hover:-translate-y-1 hover:border-[#B8923D] transition-all duration-300"
                  >
                    <div className="relative">
                      <BookCover
                        src={coverUrl}
                        title={book.title}
                        className="aspect-[2/3] w-full"
                      />
                      <FavoriteButton
                        book={{
                          id: book.id,
                          title: book.title,
                          authors: authorString(book.authors),
                          totaltime: book.totaltime,
                          coverUrl,
                        }}
                      />
                      <ProgressBar bookId={book.id} />
                    </div>
                    <div className="p-4">
                      <h2 className="font-serif text-base font-semibold text-[#3D2817] mb-1 line-clamp-2 group-hover:text-[#9A7A2E] transition-colors leading-snug">
                        {book.title}
                      </h2>
                      <p className="text-xs text-[#8B6F47] italic mb-2 line-clamp-1">
                        {authorString(book.authors)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[#A89072] pt-2 border-t border-[#E8D7B7]">
                        <span>⏱ {book.totaltime}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <Pagination
              currentPage={page}
              hasNext={hasNext}
              query={query || undefined}
            />
          </>
        )}
      </div>
    </main>
  );
}