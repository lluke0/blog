import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllSlugs, getAvailableLocales } from '@/lib/markdown';
import { getAllCategories } from '@/lib/category';
import { BlogPostJsonLd } from '@/components/JsonLd';
import { SiteHeader } from '@/components/SiteHeader';
import { TableOfContents } from '@/components/TableOfContents';
import { Footer } from '@/components/Footer';
import { CategoryBadge } from '@/components/ui/CategoryTabs';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';
import { socialLinks, displayUrl } from '@/lib/site';
import { locales, Locale } from '@/i18n/config';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    const slugs = getAllSlugs(locale);
    for (const slug of slugs) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug, locale } = await params;
  const slug = decodeURIComponent(rawSlug);

  const ogLocaleMap: Record<string, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
  };

  try {
    const post = await getPostBySlug(slug, locale as Locale);
    const tMeta = await getTranslations({ locale, namespace: 'meta' });
    const tAuthor = await getTranslations({ locale, namespace: 'author' });
    const authorName = post.author || tAuthor('name');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    const url = `${baseUrl}/${locale}/blog/${slug}`;
    const imageUrl = post.thumbnail ? `${baseUrl}${post.thumbnail}` : `${baseUrl}/og-default.png`;

    // Build hreflang alternates
    const availableLocales = getAvailableLocales(slug);
    const languages: Record<string, string> = {};
    for (const loc of availableLocales) {
      languages[loc] = `${baseUrl}/${loc}/blog/${slug}`;
    }
    languages['x-default'] = `${baseUrl}/ko/blog/${slug}`;

    return {
      title: post.seoTitle || post.title,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords || [...(post.mainCategories || []), ...(post.subCategories || [])],
      authors: [{ name: authorName }],
      openGraph: {
        type: 'article',
        locale: ogLocaleMap[locale] || 'ko_KR',
        url: url,
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        siteName: tMeta('siteTitle'),
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        publishedTime: post.date,
        authors: [authorName],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        images: [imageUrl],
      },
      alternates: {
        canonical: url,
        languages,
      },
    };
  } catch {
    const t = await getTranslations({ locale, namespace: 'posts' });
    return {
      title: t('notFound'),
    };
  }
}

export default async function BlogPost({ params }: PageProps) {
  const { slug: rawSlug, locale } = await params;
  const slug = decodeURIComponent(rawSlug);

  let post;
  try {
    post = await getPostBySlug(slug, locale as Locale);
  } catch {
    notFound();
  }

  const { mainCategories, subCategories } = await getAllCategories();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const url = `${baseUrl}/${locale}/blog/${slug}`;
  const imageUrl = post.thumbnail ? `${baseUrl}${post.thumbnail}` : undefined;

  const t = await getTranslations({ locale, namespace: 'author' });

  const dateLocaleMap: Record<string, string> = {
    ko: 'ko-KR',
    en: 'en-US',
    ja: 'ja-JP',
  };

  return (
    <>
      <BlogPostJsonLd
        title={post.seoTitle || post.title}
        description={post.seoDescription || post.excerpt}
        datePublished={post.date}
        author={post.author || t('name')}
        url={url}
        image={imageUrl}
        summary={post.summary}
        keyTakeaways={post.keyTakeaways}
        inLanguage={locale}
      />

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
    </>
  );
}
