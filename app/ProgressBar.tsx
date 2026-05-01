'use client';

import { useEffect, useState } from 'react';
import { getProgress, getProgressRatio } from './lib/progress';

export default function ProgressBar({ bookId }: { bookId: string }) {
  const [ratio, setRatio] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRatio(getProgressRatio(getProgress(bookId)));

    const handler = () => setRatio(getProgressRatio(getProgress(bookId)));
    window.addEventListener('progress-changed', handler);
    return () => window.removeEventListener('progress-changed', handler);
  }, [bookId]);

  if (!mounted || ratio === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
      <div
        className="h-full bg-[#B8923D]"
        style={{ width: `${ratio * 100}%` }}
      />
    </div>
  );
}