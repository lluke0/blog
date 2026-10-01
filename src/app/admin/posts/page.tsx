'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  mainCategories?: string[];
  subCategories?: string[];
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('정말로 이 글을 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/posts/${slug}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPosts();
        alert('글이 삭제되었습니다.');
      } else {
        alert('글 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('글 삭제 중 오류가 발생했습니다.');
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
              <span className="text-neutral-600 dark:text-gray-400">발행된 글 관리</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/drafts"
                className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-gray-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Draft 관리
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">발행된 글 목록</h1>
        </div>

        {loading ? (
          <div className="text-center py-20">
            {/* 로딩 상태 - 빈 공간으로 유지 */}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.slug}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                      {post.title}
                    </h2>
                    <p className="text-neutral-600 dark:text-gray-300 text-sm mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-gray-500">
                      <span>{new Date(post.date).toLocaleDateString('ko-KR')}</span>
                    </div>
                    {(post.mainCategories || post.subCategories) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.mainCategories?.map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                        {post.subCategories?.map((cat) => (
                          <span
                            key={cat}
                            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      href={`/ko/blog/${post.slug}`}
                      target="_blank"
                      className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      보기
                    </Link>
                    <Link
                      href={`/admin/posts/${post.slug}/edit`}
                      className="px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      편집
                    </Link>
                    <button
                      onClick={() => handleDelete(post.slug)}
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
              발행된 글이 없습니다
            </h3>
            <p className="text-neutral-600 dark:text-gray-400 mb-6">
              Draft를 작성하고 발행해보세요!
            </p>
            <Link
              href="/admin/drafts"
              className="inline-block px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
            >
              Draft 관리로 이동
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
