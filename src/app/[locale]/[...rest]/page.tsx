import { notFound } from 'next/navigation';

// 존재하지 않는 /[locale]/* 경로를 [locale]/not-found.tsx(번역된 404)로 보낸다
export default function CatchAllPage() {
  notFound();
}
