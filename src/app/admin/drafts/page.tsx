'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Draft {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  updatedAt?: string;
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const response = await fetch('/api/drafts');
      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error('Error fetching drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('정말로 이 Draft를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/drafts/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchDrafts();
      } else {
        alert('Draft 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Draft 삭제 중 오류가 발생했습니다.');
    }
  };

  const handlePublish = async (slug: string) => {
    if (!confirm('이 Draft를 발행하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/drafts/${slug}/publish`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Draft가 성공적으로 발행되었습니다!');
        fetchDrafts();
      } else {
        alert('Draft 발행에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error publishing draft:', error);
      alert('Draft 발행 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* 헤더 */}
      <header className="bg-white dark:bg-gray-900 border-b border-neutral-100 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex items-center justify-between h-[59px]">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-neutral-900 dark:text-white">
                hugdochi
              </Link>
              <span className="text-neutral-400 dark:text-gray-600">|</span>
              <span className="text-neutral-600 dark:text-gray-400">Draft 관리</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Draft 목록</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/categories"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              카테고리 관리
            </Link>
            <Link
              href="/admin/posts"
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              발행된 글 관리
            </Link>
            <Link
              href="/admin/drafts/new"
              className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              새 Draft 작성
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            {/* 로딩 상태 - 빈 공간으로 유지 */}
          </div>
        ) : drafts.length > 0 ? (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <div
                key={draft.slug}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      {draft.title}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 text-sm mb-3">
                      {draft.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-gray-500">
                      <span>{new Date(draft.date).toLocaleDateString('ko-KR')}</span>
                      {draft.updatedAt && (
                        <>
                          <span>•</span>
                          <span>수정: {new Date(draft.updatedAt).toLocaleString('ko-KR')}</span>
                        </>
                      )}
                    </div>
                    {draft.tags && draft.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {draft.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/admin/drafts/${draft.slug}/edit`}
                      className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      편집
                    </Link>
                    <button
                      onClick={() => handlePublish(draft.slug)}
                      className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      발행
                    </button>
                    <button
                      onClick={() => handleDelete(draft.slug)}
                      className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📝</div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Draft가 없습니다
            </h3>
            <p className="text-neutral-600 dark:text-gray-400 mb-6">
              새로운 Draft를 작성해보세요!
            </p>
            <Link
              href="/admin/drafts/new"
              className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              새 Draft 작성
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
