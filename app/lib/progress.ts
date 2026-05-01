export type Progress = {
  bookId: string;
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  currentTime: number; // 초 단위
  duration: number; // 초 단위 (0이면 아직 모름)
  updatedAt: number;
};

const STORAGE_KEY = 'librivox:progress';

// 모든 책의 진행도를 불러옴: { [bookId]: Progress }
function getAll(): Record<string, Progress> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, Progress>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('progress-changed'));
}

// 특정 책의 진행도 가져오기
export function getProgress(bookId: string): Progress | null {
  const all = getAll();
  return all[bookId] || null;
}

// 진행도 저장
export function saveProgress(progress: Progress): void {
  const all = getAll();
  all[progress.bookId] = progress;
  saveAll(all);
}

// 특정 책 진행도 삭제 (처음부터 듣기)
export function clearProgress(bookId: string): void {
  const all = getAll();
  delete all[bookId];
  saveAll(all);
}

// 진행도 0~1 비율
export function getProgressRatio(progress: Progress | null): number {
  if (!progress || !progress.duration) return 0;
  return Math.min(1, progress.currentTime / progress.duration);
}

// 초 → "12:34" 형태
export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}