import React from 'react';

interface SkeletonProps {
  variant?: 'text' | 'text-lg' | 'title' | 'avatar' | 'avatar-lg' | 'button' | 'card' | 'image';
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

const Skeleton: React.FC<SkeletonProps> = ({ 
  variant = 'text', 
  width, 
  height, 
  className = '', 
  count = 1 
}) => {
  const skeletonClass = `skeleton skeleton--${variant} ${className}`;
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  if (count === 1) {
    return <div className={skeletonClass} style={style} />;
  }

  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={skeletonClass} style={style} />
      ))}
    </>
  );
};

// Specialized Skeleton Components
export const SkeletonHero: React.FC = () => (
  <div className="skeleton-hero">
    <Skeleton variant="title" className="skeleton-hero__title" />
    <Skeleton variant="text-lg" className="skeleton-hero__subtitle" />
    <div className="skeleton-hero__stats">
      <Skeleton className="skeleton-stat" />
      <Skeleton className="skeleton-stat" />
      <Skeleton className="skeleton-stat" />
      <Skeleton className="skeleton-stat" />
    </div>
  </div>
);

export const SkeletonServiceCard: React.FC = () => (
  <div className="skeleton-service-card">
    <Skeleton className="skeleton-service-card__icon" />
    <Skeleton className="skeleton-service-card__title" />
    <Skeleton className="skeleton-service-card__description" count={3} />
    <Skeleton variant="button" />
  </div>
);

export const SkeletonTeamCard: React.FC = () => (
  <div className="skeleton-team-card">
    <Skeleton className="skeleton-team-card__avatar" />
    <Skeleton className="skeleton-team-card__name" />
    <Skeleton className="skeleton-team-card__role" />
    <Skeleton className="skeleton-team-card__bio" count={3} />
  </div>
);

export const SkeletonBlogCard: React.FC = () => (
  <div className="skeleton-blog-card">
    <Skeleton className="skeleton-blog-card__image" />
    <div className="skeleton-blog-card__content">
      <Skeleton className="skeleton-blog-card__title" />
      <Skeleton className="skeleton-blog-card__excerpt" count={3} />
      <div className="skeleton-blog-card__meta">
        <Skeleton className="skeleton-blog-card__date" />
        <Skeleton className="skeleton-blog-card__author" />
      </div>
    </div>
  </div>
);

export const SkeletonForm: React.FC = () => (
  <div className="skeleton-form">
    <Skeleton className="skeleton-form__field" />
    <Skeleton className="skeleton-form__field" />
    <Skeleton className="skeleton-form__field" />
    <Skeleton className="skeleton-form__textarea" />
    <Skeleton className="skeleton-form__submit" />
  </div>
);

export const SkeletonNav: React.FC = () => (
  <div className="skeleton-nav">
    <Skeleton className="skeleton-nav__logo" />
    <div className="skeleton-nav__menu">
      <Skeleton className="skeleton-nav__item" />
      <Skeleton className="skeleton-nav__item" />
      <Skeleton className="skeleton-nav__item" />
      <Skeleton className="skeleton-nav__item" />
    </div>
    <Skeleton className="skeleton-nav__cta" />
  </div>
);

// Grid Layouts
export const SkeletonServicesGrid: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="skeleton-services">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonServiceCard key={index} />
    ))}
  </div>
);

export const SkeletonTeamGrid: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonTeamCard key={index} />
    ))}
  </div>
);

export const SkeletonBlogGrid: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="skeleton-grid">
    {Array.from({ length: count }, (_, index) => (
      <SkeletonBlogCard key={index} />
    ))}
  </div>
);

// Loading Container
interface SkeletonContainerProps {
  children: React.ReactNode;
  loading: boolean;
  skeleton: React.ReactNode;
  className?: string;
}

export const SkeletonContainer: React.FC<SkeletonContainerProps> = ({
  children,
  loading,
  skeleton,
  className = ''
}) => {
  return (
    <div className={`skeleton-container ${className}`}>
      {loading ? (
        <div className="skeleton-fade-in">{skeleton}</div>
      ) : (
        <div className="content-loaded">{children}</div>
      )}
    </div>
  );
};

export default Skeleton;