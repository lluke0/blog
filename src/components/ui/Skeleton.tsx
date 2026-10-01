import * as React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'rounded';
  animation?: 'pulse' | 'shimmer' | 'none';
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className = '', variant = 'default', animation = 'shimmer', ...props }, ref) => {
    const variantStyles = {
      default: 'rounded-md',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
    };

    const animationStyles = {
      pulse: 'animate-pulse-soft',
      shimmer: 'bg-gradient-to-r from-foreground/10 via-foreground/5 to-foreground/10 bg-[length:200%_100%] animate-shimmer',
      none: '',
    };

    const baseStyles = animation === 'shimmer'
      ? ''
      : 'bg-foreground/10';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${animationStyles[animation]} ${className}`}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

// 포스트 목록 행 스켈레톤 - 리스트 레이아웃용 (ul 안에서 사용)
function PostListItemSkeleton() {
  return (
    <li className="border-b border-border py-8 space-y-3">
      {/* 제목 */}
      <Skeleton className="h-7 w-3/4" />

      {/* 본문 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
    </li>
  );
}

// 텍스트 라인 스켈레톤
function TextSkeleton({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-4/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

// 아바타 스켈레톤
function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  return <Skeleton className={sizeStyles[size]} variant="circular" />;
}

export { Skeleton, PostListItemSkeleton, TextSkeleton, AvatarSkeleton };
