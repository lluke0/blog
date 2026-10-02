import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  const t = useTranslations('notFound');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-foreground tracking-tighter mb-4">404</h1>
          <p className="text-muted-foreground mb-8">{t('description')}</p>
          <Link
            href="/"
            className="text-foreground underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground transition-colors"
          >
            {t('home')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
