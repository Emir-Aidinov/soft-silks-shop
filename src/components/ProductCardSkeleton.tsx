import { Skeleton } from "@/components/ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="relative bg-card rounded-xl overflow-hidden shadow-soft border border-border/50">
      <div className="aspect-[3/4] overflow-hidden relative">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
};

export const ProductCardSkeletonGrid = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
