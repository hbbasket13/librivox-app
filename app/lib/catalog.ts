import { readFile } from 'fs/promises';
import { join } from 'path';

export type CatalogBook = {
  id: string;
  title: string;
  description: string;
  language: string;
  totaltime: string;
  url_zip_file: string;
  authors: Array<{ first_name: string; last_name: string }>;
  genres: string[];
};

let cache: CatalogBook[] | null = null;

// 카탈로그를 메모리에 로드 (한 번만)
async function loadCatalog(): Promise<CatalogBook[]> {
  if (cache) return cache;

  const filePath = join(process.cwd(), 'public', 'catalog.json');
  const raw = await readFile(filePath, 'utf-8');
  cache = JSON.parse(raw);
  console.log(`[Catalog] Loaded ${cache!.length} books`);
  return cache!;
}

// 검색 실행 (제목, 작가, 설명 어디서든 매칭)
export async function searchBooks(
  query: string,
  page: number = 1,
  pageSize: number = 12
): Promise<{ books: CatalogBook[]; total: number; hasNext: boolean }> {
  const books = await loadCatalog();

  if (!query.trim()) {
    // 검색어 없으면 전체 (페이지네이션)
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return {
      books: books.slice(start, end),
      total: books.length,
      hasNext: end < books.length,
    };
  }

  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);

  // 점수 기반 검색: 더 정확한 매칭일수록 위로
  const scored = books
    .map((book) => {
      const titleLower = book.title.toLowerCase();
      const authorsLower = book.authors
        .map((a) => `${a.first_name} ${a.last_name}`.toLowerCase())
        .join(' ');
      const descLower = (book.description || '').toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (titleLower === term) score += 100;
        else if (titleLower.startsWith(term)) score += 50;
        else if (titleLower.includes(term)) score += 20;
        if (authorsLower.includes(term)) score += 15;
        if (descLower.includes(term)) score += 5;
      }
      return { book, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const total = scored.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paged = scored.slice(start, end).map((x) => x.book);

  return {
    books: paged,
    total,
    hasNext: end < total,
  };
}