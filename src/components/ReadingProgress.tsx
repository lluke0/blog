'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

// 헤더 하단 경계선에 붙어서 그려진다 (부모가 relative여야 함).
// 페이지 이동용 NProgress 바는 화면 맨 위에 있으므로 서로 겹치지 않는다.
export function ReadingProgress() {
  const t = useTranslations('post');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0) {
        const scrollProgress = (scrollTop / docHeight) * 100;
        setProgress(Math.min(100, Math.max(0, scrollProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="absolute left-0 -bottom-px h-0.5 bg-foreground transition-[width] duration-100 ease-linear"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={t('readingProgress')}
    />
  );
}
