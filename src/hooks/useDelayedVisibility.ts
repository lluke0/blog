'use client';

import { useEffect, useRef, useState } from 'react';

interface Options {
  // active가 이 시간(ms) 넘게 이어질 때만 보이기 시작한다
  delay?: number;
  // 한 번 보이면 최소 이 시간(ms) 동안 유지한다
  minDuration?: number;
}

// 로딩 표시(스켈레톤 등)가 짧게 깜빡이지 않도록 노출 시점을 조절한다.
// - 로딩이 delay 안에 끝나면 아예 보이지 않는다
// - 한 번 보이면 로딩이 먼저 끝나도 minDuration을 채운 뒤에 사라진다
export function useDelayedVisibility(
  active: boolean,
  { delay = 500, minDuration = 2000 }: Options = {}
) {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef(0);

  useEffect(() => {
    if (active) {
      if (visible) return;
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }

    if (!visible) return;
    const remaining = minDuration - (Date.now() - shownAtRef.current);
    const timer = setTimeout(() => setVisible(false), Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [active, visible, delay, minDuration]);

  return visible;
}
