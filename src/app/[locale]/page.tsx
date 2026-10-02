'use client';

import { useEffect, useState } from "react";
import { Category } from "@/types/blog";
import { WebsiteJsonLd } from "@/components/JsonLd";
import { CategoryTabs, CategoryPills } from "@/components/ui/CategoryTabs";
import { PostListItemSkeleton } from "@/components/ui/Skeleton";
import { PostListItem } from "@/components/PostListItem";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { useDelayedVisibility } from "@/hooks/useDelayedVisibility";
import { useLocale, useTranslations } from 'next-intl';

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  mainCategories?: string[];
  subCategories?: string[];
  author?: string;
  readTime?: string;
  thumbnail?: string;
}

export default function Home() {
  const locale = useLocale();
  const t = useTranslations();
  const [posts, setPosts] = useState<Post[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('recommended');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  // 0.5초 안에 끝나는 로딩은 스켈레톤 없이 넘어가고, 한 번 보인 스켈레톤은 최소 2초 유지한다
  const showSkeleton = useDelayedVisibility(loading, { delay: 500, minDuration: 2000 });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const fetchData = async () => {
    try {
      const [postsRes, categoriesRes] = await Promise.all([
        fetch(`/api/posts?locale=${locale}`),
        fetch('/api/categories'),
      ]);

      const postsData = await postsRes.json();
      const categoriesData = await categoriesRes.json();

      setPosts(postsData);
      const translatedMain = (categoriesData.mainCategories || []).map((cat: Category) => ({
        ...cat,
        name: t(`categories.${cat.id}` as never) || cat.name,
      }));
      setMainCategories(translatedMain);
      setSubCategories(categoriesData.subCategories || []);

      const hasRecommended = categoriesData.mainCategories?.some(
        (cat: Category) => cat.id === 'recommended'
      );

      if (!hasRecommended) {
        setSelectedMainCategory('all');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (selectedMainCategory !== 'all') {
      if (!post.mainCategories?.includes(selectedMainCategory)) {
        return false;
      }
    }

    if (selectedSubCategory !== 'all') {
      if (!post.subCategories?.includes(selectedSubCategory)) {
        return false;
      }
    }

    return true;
  });

  // 글이 하나도 없으면 필터와 관계없이 '첫 글을 기다리는 중' 안내를 보여준다
  const isFiltered =
    posts.length > 0 && (selectedMainCategory !== 'all' || selectedSubCategory !== 'all');

  // 기본 선택 탭인 '추천'을 맨 앞에 두고, 그 뒤에 '전체'와 나머지 카테고리를 둔다
  const recommended = mainCategories.find((cat) => cat.id === 'recommended');
  const tabs = [
    ...(recommended ? [recommended] : []),
    { id: 'all', name: t('categories.all') },
    ...mainCategories.filter((cat) => cat.id !== 'recommended'),
  ];

  return (
    <>
      <WebsiteJsonLd
        name={t('meta.siteTitle')}
        description={t('meta.siteDescription')}
        url={process.env.NEXT_PUBLIC_BASE_URL || "https://yourdomain.com"}
        author={t('author.name')}
      />

      <div className="min-h-screen bg-background">
        <SiteHeader />

        {/* Main Content */}
        <main className="max-w-content mx-auto px-6 md:px-8 pt-12 md:pt-16 pb-12">
          {/* Category Tabs */}
          <div className={subCategories.length > 0 ? 'mb-6' : 'mb-2'}>
            <CategoryTabs
              categories={tabs}
              selectedCategory={selectedMainCategory}
              onSelect={(categoryId) => {
                setSelectedMainCategory(categoryId);
                setSelectedSubCategory('all');
              }}
            />
          </div>

          {/* Sub-category Pills */}
          {subCategories.length > 0 && (
            <div className="mb-2">
              <CategoryPills
                categories={subCategories}
                selectedCategory={selectedSubCategory}
                onSelect={setSelectedSubCategory}
                allLabel={t('categories.all')}
              />
            </div>
          )}

          {/* Article List */}
          {showSkeleton ? (
            <ul aria-hidden="true">
              {[1, 2, 3, 4].map((i) => (
                <PostListItemSkeleton key={i} />
              ))}
            </ul>
          ) : loading ? (
            // 스켈레톤을 띄우기 전(0.5초 이내)에는 빈 상태 문구가 잠깐 보이지 않도록 비워 둔다
            null
          ) : filteredPosts.length > 0 ? (
            <ul>
              {filteredPosts.map((post) => {
                const category = mainCategories.find((c) => c.id === post.mainCategories?.[0]);
                return (
                  <PostListItem
                    key={post.slug}
                    post={post}
                    categoryName={category?.name}
                    locale={locale}
                  />
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-20">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-3">
                {isFiltered ? t('posts.empty.filtered') : t('posts.empty.default')}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isFiltered
                  ? t('posts.empty.filteredDescription')
                  : t('posts.empty.defaultDescription')}
              </p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
