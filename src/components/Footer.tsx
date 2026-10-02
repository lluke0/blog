'use client';

import { useTranslations } from 'next-intl';
import { GitHubIcon, LinkedInIcon } from '@/components/SocialIcons';
import { socialLinks } from '@/lib/site';

export function Footer() {
  const t = useTranslations('footer');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border mt-16 bg-background">
      <div className="max-w-content mx-auto px-6 md:px-8 py-8 flex flex-col-reverse items-center gap-5 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {t('brand')}
        </p>

        <div className="flex items-center gap-5">
          <a
            href={socialLinks.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </a>
          <a
            href={socialLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </a>
          <span className="h-4 w-px bg-border" aria-hidden="true" />
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            {t('backToTop')}
          </button>
        </div>
      </div>
    </footer>
  );
}
