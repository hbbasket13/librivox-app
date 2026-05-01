// LibriVox 전체 카탈로그를 받아서 public/catalog.json으로 저장
// 실행: npm run fetch-catalog

import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'public', 'catalog.json');
const BATCH_SIZE = 1000;
const DELAY_MS = 500;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchBatch(offset) {
  const url =
    `https://librivox.org/api/feed/audiobooks/?format=json&extended=1` +
    `&limit=${BATCH_SIZE}&offset=${offset}`;
  const res = await fetch(url);
  // 404는 "더 이상 책 없음" 신호
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} at offset ${offset}`);
  const data = await res.json();
  return data.books || [];
}

function trim(book) {
  return {
    id: book.id,
    title: book.title,
    description: (book.description || '').slice(0, 500),
    language: book.language,
    totaltime: book.totaltime,
    url_zip_file: book.url_zip_file,
    authors: (book.authors || []).map((a) => ({
      first_name: a.first_name,
      last_name: a.last_name,
    })),
    genres: (book.genres || []).map((g) => g.name),
  };
}

async function main() {
  console.log('📚 LibriVox 카탈로그 다운로드 시작...');
  const all = [];
  let offset = 0;

  while (true) {
    process.stdout.write(`  offset ${offset}... `);
    let books;
    try {
      books = await fetchBatch(offset);
    } catch (err) {
      console.log(`\n  ⚠️ 에러: ${err.message}, 5초 후 재시도`);
      await sleep(5000);
      continue;
    }

    // 404 또는 빈 배열 → 끝
    if (books === null || books.length === 0) {
      console.log('done.');
      break;
    }

    all.push(...books.map(trim));
    console.log(`+${books.length} (총 ${all.length}권)`);
    offset += BATCH_SIZE;
    await sleep(DELAY_MS);
  }

  console.log(`\n✓ 총 ${all.length}권`);
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(all));
  console.log(`✓ 저장: ${OUTPUT_PATH}`);
  console.log(`✓ 크기: ${(JSON.stringify(all).length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});