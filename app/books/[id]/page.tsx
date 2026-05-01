import Link from 'next/link';
import { notFound } from 'next/navigation';
import AudioPlayer from './AudioPlayer';
import BookCover from '../../BookCover';
import FavoriteButton from '../../FavoriteButton';
import { getCoverUrl } from '../../lib/librivox';

type Author = {
  id: string;
  first_name: string;
  last_name: string;
};

type Section = {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  playtime: string;
};

type Audiobook = {
  id: string;
  title: string;
  description: string;
  language: string;
  authors: Author[];
  totaltime: string;
  url_zip_file: string;
  sections: Section[];
};

async function getBook(id: string): Promise<Audiobook | null> {
  const res = await fetch(
    `https://librivox.org/api/feed/audiobooks/?id=${id}&extended=1&format=json`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.books?.[0] || null;
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) notFound();

  const authorString =
    book.authors
      ?.map((a) => `${a.first_name} ${a.last_name}`)
      .join(', ') || '저자 미상';
  const coverUrl = getCoverUrl(book.url_zip_file, book.id);

  return (
    <main className="min-h-screen bg-[#F5EFE6] pb-40">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#8B6F47] hover:text-[#3D2817] transition-colors mb-10 text-sm"
        >
          <span>←</span>
          <span>도서관으로 돌아가기</span>
        </Link>

        <header className="text-center mb-12 pb-10 border-b border-[#E8D7B7]">
          <div className="flex justify-center mb-8">
            <BookCover
              src={coverUrl}
              title={book.title}
              className="aspect-[2/3] w-56 rounded-lg shadow-[0_12px_32px_rgba(120,80,40,0.3)]"
            />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold text-[#3D2817] mb-4 leading-tight">
            {book.title}
          </h1>
          <p className="text-lg text-[#8B6F47] italic mb-5">
            by {authorString}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-[#A89072] mb-6">
            <span>⏱ {book.totaltime}</span>
            <span className="text-[#D4C5A0]">·</span>
            <span>🌐 {book.language}</span>
          </div>

          <div className="flex justify-center">
            <FavoriteButton
              size="lg"
              book={{
                id: book.id,
                title: book.title,
                authors: authorString,
                totaltime: book.totaltime,
                coverUrl,
              }}
            />
          </div>
        </header>

        {book.description && (
          <div
            className="bg-[#FFFBF5] rounded-lg shadow-[0_4px_12px_rgba(120,80,40,0.08)] border border-[#E8D7B7] p-8 mb-12 text-[#5C4530] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: book.description }}
          />
        )}

        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#3D2817]">
              챕터
            </h2>
            <span className="text-[#B8923D] text-sm">
              {book.sections?.length || 0}개
            </span>
          </div>
          <AudioPlayer sections={book.sections || []} />
        </section>
      </div>
    </main>
  );
}