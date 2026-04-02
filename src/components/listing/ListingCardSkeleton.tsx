interface ListingCardSkeletonProps {
  variant?: 'grid' | 'list';
}

const ListingCardSkeleton = ({ variant = 'grid' }: ListingCardSkeletonProps) => {
  if (variant === 'list') {
    return (
      <div className="flex bg-surface rounded-card border border-border overflow-hidden animate-pulse">
        <div className="w-[200px] flex-shrink-0 bg-background aspect-[4/3]" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-5 bg-background rounded w-24" />
          <div className="h-4 bg-background rounded w-3/4" />
          <div className="h-3 bg-background rounded w-full" />
          <div className="h-3 bg-background rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-card border border-border overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-background" />
      <div className="p-3 space-y-2">
        <div className="h-5 bg-background rounded w-24" />
        <div className="h-4 bg-background rounded w-3/4" />
        <div className="flex gap-2 pt-1">
          <div className="h-3 bg-background rounded w-20" />
          <div className="h-3 bg-background rounded w-12" />
        </div>
        <div className="h-3 bg-background rounded w-16 pt-1 border-t border-border" />
      </div>
    </div>
  );
};

export default ListingCardSkeleton;
