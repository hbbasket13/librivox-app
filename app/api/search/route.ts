import { NextRequest, NextResponse } from 'next/server';
import { searchBooks } from '../../lib/catalog';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    const result = await searchBooks(query, page, 12);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[Search API]', err);
    return NextResponse.json(
      { books: [], total: 0, hasNext: false, error: true },
      { status: 500 }
    );
  }
}