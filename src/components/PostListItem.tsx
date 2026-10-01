import { Link } from '@/i18n/navigation';
import { BlogPost } from '@/types/blog';

interface PostListItemProps {
  post: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'date'>;
  categoryName?: string;
  locale: string;
}

const dateLocaleMap: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

export function PostListItem({ post, categoryName, locale }: PostListItemProps) {
  return (
    <li className="border-b border-border">
      <Link href={`/blog/${post.slug}`} className="group block py-8">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground line-clamp-2 leading-snug tracking-tight group-hover:text-foreground/70 transition-colors">
          {post.title}
        </h2>

        <p className="mt-2 text-base text-muted-foreground line-clamp-2">
          {post.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          {categoryName && (
            <>
              <span>{categoryName}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(dateLocaleMap[locale] || 'ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
      </Link>
    </li>
  );
}
