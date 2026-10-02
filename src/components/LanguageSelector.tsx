'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { Locale, locales } from '@/i18n/config';

const localeLabels: Record<Locale, string> = {
  ko: 'KO',
  en: 'EN',
  ja: 'JA',
};

export function LanguageSelector() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="icon-button text-xs font-semibold"
        aria-label={t('label')}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {localeLabels[locale]}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-40 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              role="menuitem"
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                loc === locale
                  ? 'bg-foreground/10 text-foreground font-medium'
                  : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
              }`}
            >
              <span className="w-6 text-xs font-semibold text-muted-foreground">{localeLabels[loc]}</span>
              <span>{t(loc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
