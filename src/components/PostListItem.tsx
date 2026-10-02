import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { BlogPost } from '@/types/blog';

interface PostListItemProps {
  post: Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'date' | 'readTime' | 'thumbnail'>;
  categoryName?: string;
  locale: string;
}

const dateLocaleMap: Record<string, string> = {
  ko: 'ko-KR',
  en: 'en-US',
  ja: 'ja-JP',
};

export function PostListItem({ post, categoryName, locale }: PostListItemProps) {
  const formattedDate = new Date(post.date).toLocaleDateString(dateLocaleMap[locale] || 'ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const meta = [
    categoryName,
    <time key="date" dateTime={post.date}>{formattedDate}</time>,
    post.readTime,
  ].filter(Boolean);

  return (
    <li className="border-b border-border">
      <Link href={`/blog/${post.slug}`} className="group flex items-start gap-5 sm:gap-8 py-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground line-clamp-2 leading-snug tracking-tight decoration-foreground/25 decoration-2 underline-offset-4 group-hover:underline">
            {post.title}
          </h2>

          <p className="mt-2 text-base text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
            {meta.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>

        {post.thumbnail && (
          <div className="relative shrink-0 w-20 aspect-square sm:w-36 sm:aspect-[3/2] overflow-hidden rounded-md bg-muted">
            <Image
              src={post.thumbnail}
              alt=""
              fill
              sizes="(min-width: 640px) 144px, 80px"
              unoptimized={post.thumbnail.startsWith('http')}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>
    </li>
  );
}
