import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { getDraftBySlug } from '@/lib/draft';
import { PostView } from '@/components/PostView';
import { defaultLocale } from '@/i18n/config';

// 저장할 때마다 최신 내용을 보여야 하므로 요청마다 다시 렌더링한다
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadDraft(rawSlug: string) {
  const slug = decodeURIComponent(rawSlug);
  if (slug.includes('/') || slug.includes('\\') || slug.includes('..')) {
    notFound();
  }

  try {
    return await getDraftBySlug(slug);
  } catch {
    notFound();
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const draft = await loadDraft(slug);

  return {
    title: `미리보기 - ${draft.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function DraftPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  const draft = await loadDraft(slug);
  // 헤더·목차·푸터가 다국어 메시지를 쓰므로 [locale] 레이아웃 대신 기본 언어 메시지를 넣어 준다
  const messages = await getMessages({ locale: defaultLocale });

  return (
    <NextIntlClientProvider locale={defaultLocale} messages={messages}>
      <div className="border-b border-border bg-muted">
        <div className="max-w-content mx-auto px-6 md:px-8 py-2.5 flex items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Draft 미리보기</span>
            <span className="hidden sm:inline"> · 발행하면 이렇게 보입니다</span>
          </p>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/drafts/${encodeURIComponent(draft.slug)}/edit`}
              className="px-3 py-1 rounded font-medium text-foreground hover:bg-background transition-colors"
            >
              편집
            </Link>
            <Link
              href="/admin/drafts"
              className="px-3 py-1 rounded font-medium text-foreground hover:bg-background transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>
      </div>

      <PostView post={draft} locale={defaultLocale} />
    </NextIntlClientProvider>
  );
}
