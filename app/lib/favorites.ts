// 책 즐겨찾기에 저장할 정보
export type FavoriteBook = {
  id: string;
  title: string;
  authors: string;
  totaltime: string;
  coverUrl: string | null;
  savedAt: number; // 저장한 시각 (정렬용)
};

const STORAGE_KEY = 'librivox:favorites';

// localStorage에서 즐겨찾기 목록 전부 불러오기
export function getFavorites(): FavoriteBook[] {
  if (typeof window === 'undefined') return []; // 서버에서는 빈 배열
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// 특정 책이 즐겨찾기인지 확인
export function isFavorite(bookId: string): boolean {
  return getFavorites().some((b) => b.id === bookId);
}

// 즐겨찾기에 추가 (이미 있으면 무시)
export function addFavorite(book: Omit<FavoriteBook, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavorites();
  if (favorites.some((b) => b.id === book.id)) return;
  const updated: FavoriteBook[] = [
    { ...book, savedAt: Date.now() },
    ...favorites,
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  // 같은 페이지의 다른 컴포넌트들에게 알림
  window.dispatchEvent(new Event('favorites-changed'));
}

// 즐겨찾기에서 제거
export function removeFavorite(bookId: string): void {
  if (typeof window === 'undefined') return;
  const updated = getFavorites().filter((b) => b.id !== bookId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event('favorites-changed'));
}

// 토글 (있으면 제거, 없으면 추가)
export function toggleFavorite(book: Omit<FavoriteBook, 'savedAt'>): boolean {
  if (isFavorite(book.id)) {
    removeFavorite(book.id);
    return false;
  } else {
    addFavorite(book);
    return true;
  }
}