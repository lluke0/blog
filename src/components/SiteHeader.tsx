'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { ReadingProgress } from '@/components/ReadingProgress';
import { GitHubIcon } from '@/components/SocialIcons';
import { socialLinks } from '@/lib/site';

interface SiteHeaderProps {
  showReadingProgress?: boolean;
}

export function SiteHeader({ showReadingProgress = false }: SiteHeaderProps) {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 nav-blur">
      <div className="max-w-content mx-auto px-6 md:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors tracking-tighter"
          >
            {t('nav.brand')}
          </Link>
          <div className="flex items-center gap-2">
            {process.env.NODE_ENV === 'development' && (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a
                href="/admin/drafts"
                className="mr-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('nav.draft')}
              </a>
            )}
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-button"
              aria-label={t('nav.github')}
            >
              <GitHubIcon />
            </a>
            <ThemeToggle lightLabel={t('theme.light')} darkLabel={t('theme.dark')} />
            <LanguageSelector />
          </div>
        </div>
      </div>
      {showReadingProgress && <ReadingProgress />}
    </header>
  );
}
