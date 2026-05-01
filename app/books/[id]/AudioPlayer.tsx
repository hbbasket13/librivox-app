'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getProgress,
  saveProgress,
  clearProgress,
  formatTime,
} from '../../lib/progress';

type Section = {
  id: string;
  section_number: string;
  title: string;
  listen_url: string;
  playtime: string;
};

export default function AudioPlayer({ sections }: { sections: Section[] }) {
  const params = useParams();
  const bookId = String(params.id);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [resumeTime, setResumeTime] = useState<number>(0);
  const [savedProgress, setSavedProgress] = useState<{
    sectionId: string;
    sectionNumber: string;
    sectionTitle: string;
    currentTime: number;
    duration: number;
  } | null>(null);

  // 처음 마운트 시 저장된 진행도 불러오기
  useEffect(() => {
    const p = getProgress(bookId);
    if (p) {
      setSavedProgress({
        sectionId: p.sectionId,
        sectionNumber: p.sectionNumber,
        sectionTitle: p.sectionTitle,
        currentTime: p.currentTime,
        duration: p.duration,
      });
    }
  }, [bookId]);

  // 재생 위치를 3초마다 저장
  useEffect(() => {
    if (!currentSection) return;
    const audio = audioRef.current;
    if (!audio) return;

    const interval = setInterval(() => {
      if (audio.paused) return;
      saveProgress({
        bookId,
        sectionId: currentSection.id,
        sectionNumber: currentSection.section_number,
        sectionTitle: currentSection.title,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        updatedAt: Date.now(),
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentSection, bookId]);

  // 새 챕터 로드되면 저장된 위치에서 시작
  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (resumeTime > 0 && resumeTime < audio.duration) {
      audio.currentTime = resumeTime;
    }
    setResumeTime(0); // 한 번만 적용
  };

  // 챕터 클릭 (처음부터)
  const playSection = (section: Section, fromStart = true) => {
    setResumeTime(fromStart ? 0 : 0);
    setCurrentSection(section);
  };

  // 이어듣기 (저장된 위치부터)
  const handleResume = () => {
    if (!savedProgress) return;
    const section = sections.find((s) => s.id === savedProgress.sectionId);
    if (!section) return;
    setResumeTime(savedProgress.currentTime);
    setCurrentSection(section);
  };

  // 처음부터 듣기 (저장 위치 삭제 + 첫 챕터 재생)
  const handleStartOver = () => {
    clearProgress(bookId);
    setSavedProgress(null);
    setResumeTime(0);
    if (sections[0]) setCurrentSection(sections[0]);
  };

  return (
    <>
      {/* 이어듣기 패널 */}
      {savedProgress && !currentSection && (
        <div className="bg-[#FFF4DC] border-l-4 border-[#B8923D] rounded-r-lg p-5 mb-6 shadow-[0_2px_8px_rgba(184,146,61,0.15)]">
          <p className="text-xs text-[#B8923D] font-semibold tracking-wider uppercase mb-2">
            이어듣기
          </p>
          <p className="font-serif text-[#3D2817] mb-1">
            Chapter {savedProgress.sectionNumber}: {savedProgress.sectionTitle}
          </p>
          <p className="text-sm text-[#8B6F47] mb-4">
            {formatTime(savedProgress.currentTime)}
            {savedProgress.duration > 0 &&
              ` / ${formatTime(savedProgress.duration)}`}
            {savedProgress.duration > 0 && (
              <span className="ml-2 text-[#B8923D]">
                (
                {Math.round(
                  (savedProgress.currentTime / savedProgress.duration) * 100
                )}
                %)
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-[#B8923D] hover:bg-[#9A7A2E] text-white rounded-md text-sm font-medium transition-colors"
            >
              ▶ 이어듣기
            </button>
            <button
              onClick={handleStartOver}
              className="px-4 py-2 bg-[#FFFBF5] border border-[#E8D7B7] hover:border-[#B8923D] text-[#3D2817] rounded-md text-sm font-medium transition-colors"
            >
              처음부터 듣기
            </button>
          </div>
        </div>
      )}

      {/* 챕터 리스트 */}
      <div className="space-y-2">
        {sections.map((section) => {
          const isPlaying = currentSection?.id === section.id;
          const isLastListened = savedProgress?.sectionId === section.id;
          return (
            <button
              key={section.id}
              onClick={() => playSection(section, true)}
              className={`w-full text-left p-4 rounded-lg transition-all ${
                isPlaying
                  ? 'bg-[#FFF4DC] border-l-4 border-[#B8923D] shadow-[0_4px_12px_rgba(184,146,61,0.2)]'
                  : 'bg-[#FFFBF5] border-l-4 border-transparent hover:bg-[#FAF3E0] hover:border-[#D4C5A0]'
              }`}
            >
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <span
                    className={`text-xs font-mono w-6 ${
                      isPlaying ? 'text-[#B8923D] font-bold' : 'text-[#A89072]'
                    }`}
                  >
                    {String(section.section_number).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-medium truncate ${
                      isPlaying ? 'text-[#3D2817]' : 'text-[#5C4530]'
                    }`}
                  >
                    {isPlaying && '▶ '}
                    {section.title}
                  </span>
                  {isLastListened && !isPlaying && (
                    <span className="text-xs text-[#B8923D] italic whitespace-nowrap">
                      마지막 들은 곳
                    </span>
                  )}
                </div>
                <span className="text-sm text-[#A89072] whitespace-nowrap">
                  {section.playtime}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 하단 플레이어 */}
      {currentSection && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#3D2817] border-t-2 border-[#B8923D] shadow-2xl p-4 z-50">
          <div className="max-w-4xl mx-auto">
            <p className="font-serif text-[#F5EFE6] mb-3 text-sm truncate">
              <span className="text-[#B8923D] font-semibold">▶ 재생 중</span>
              <span className="text-[#A89072] mx-2">·</span>
              <span>
                Chapter {currentSection.section_number}: {currentSection.title}
              </span>
            </p>
            <audio
              ref={audioRef}
              key={currentSection.id}
              src={currentSection.listen_url}
              controls
              autoPlay
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}