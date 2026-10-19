import { getTranslations } from 'next-intl/server';
import { getAllCategories } from '@/lib/category';
import { SiteHeader } from '@/components/SiteHeader';
import { TableOfContents } from '@/components/TableOfContents';
import { Footer } from '@/components/Footer';
import { CategoryBadge } from '@/components/ui/CategoryTabs';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';
import { socialLinks, displayUrl } from '@/lib/site';
import { BlogPost } from '@/types/blog';

interface PostViewProps {
  post: Pick<BlogPost, 'title' | 'date' | 'content' | 'author' | 'readTime' | 'mainCategories' | 'subCategories'>;
  locale: string;
}

const dateLocaleMap: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

// 글 상세 화면. 발행된 글(/blog/[slug])과 Draft 미리보기가 함께 쓴다
export async function PostView({ post, locale }: PostViewProps) {
  const { mainCategories, subCategories } = await getAllCategories();
  const t = await getTranslations({ locale, namespace: 'author' });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader showReadingProgress />

      {/* Table of Contents - 본문 칼럼 왼쪽 바깥에 고정 (본문 텍스트와 4rem 간격) */}
      <aside
        className="hidden xl:block fixed top-28 w-48 max-h-[calc(100vh-9rem)] overflow-y-auto scrollbar-hide z-30"
        style={{ left: 'max(2rem, calc(50% - 23rem - 14rem))' }}
      >
        <TableOfContents />
      </aside>

      {/* Main Content */}
      <div className="max-w-prose mx-auto px-6 md:px-8 pt-12 pb-12 md:pt-16 md:pb-16">
        <main className="w-full">
            <article className="animate-fade-in-up">
              {/* Article Header */}
              <header className="mb-12">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight tracking-tighter">
                  {post.title}
                </h1>

                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-x-2 text-base text-muted-foreground">
                    <span>{post.author || t('name')}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={post.date}>
                      {new Date(post.date).toLocaleDateString(dateLocaleMap[locale] || 'ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </time>
                    {post.readTime && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{post.readTime}</span>
                      </>
                    )}
                  </div>

                  {(post.mainCategories || post.subCategories) && (
                    <div className="flex flex-wrap gap-2">
                      {post.mainCategories?.map((catId) => {
                        const category = mainCategories.find((c) => c.id === catId);
                        return category ? (
                          <CategoryBadge key={catId} category={category} variant="primary" />
                        ) : null;
                      })}
                      {post.subCategories?.map((catId) => {
                        const category = subCategories.find((c) => c.id === catId);
                        return category ? (
                          <CategoryBadge key={catId} category={category} variant="secondary" />
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </header>

              {/* Article Content */}
              <div
                className="prose-blog"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Author Card */}
              <section className="mt-16 rounded-lg border border-border p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">{t('name')}</h2>
                <ul className="space-y-2">
                  <li>
                    <a
                      href={socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <GitHubIcon className="w-4 h-4" />
                      {displayUrl(socialLinks.github)}
                    </a>
                  </li>
                  <li>
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LinkedInIcon className="w-4 h-4" />
                      {displayUrl(socialLinks.linkedin)}
                    </a>
                  </li>
                </ul>
              </section>
            </article>
        </main>
      </div>

      <Footer />
    </div>
  );
}
