import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllSlugs, getAvailableLocales } from '@/lib/markdown';
import { BlogPostJsonLd } from '@/components/JsonLd';
import { PostView } from '@/components/PostView';
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  const url = `${baseUrl}/${locale}/blog/${slug}`;
  const imageUrl = post.thumbnail ? `${baseUrl}${post.thumbnail}` : undefined;

  const t = await getTranslations({ locale, namespace: 'author' });

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

      <PostView post={post} locale={locale} />
    </>
  );
}
