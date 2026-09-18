import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Base animated skeleton block
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/80 dark:bg-slate-800/80 ${className}`}
      {...props}
    />
  );
};

/**
 * Skeleton placeholder that mirrors the exact layout of ProductCard
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs flex flex-col h-full animate-pulse">
      {/* Image Skeleton */}
      <div className="relative aspect-4/3 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4">
        {/* Top Badges placeholder */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="w-14 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        {/* Image center icon placeholder */}
        <div className="w-12 h-12 rounded-2xl bg-slate-200/60 dark:bg-slate-700/60" />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category tag */}
          <div className="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded-md" />
          {/* Title lines */}
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          {/* Short description */}
          <div className="w-5/6 h-3 bg-slate-100 dark:bg-slate-800 rounded-md mt-1" />
        </div>

        {/* Pricing and Button */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="w-12 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Grid of product card skeletons
 */
export const ProductGridSkeleton: React.FC<{ count?: number; columns?: string }> = ({
  count = 8,
  columns = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
}) => {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Skeleton for the detailed product page
 */
export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="py-8 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <div className="w-20 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <span className="text-slate-300">/</span>
        <div className="w-28 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <span className="text-slate-300">/</span>
        <div className="w-36 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>

      {/* Main Product Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-2 items-start">
        {/* Left: Product Image Skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        </div>

        {/* Right: Product Details Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            <div className="w-4/5 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            <div className="w-1/2 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="w-32 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="w-40 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="w-48 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="w-3/4 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-4 pt-2">
            <div className="w-32 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
            <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800" />
            <div className="h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800" />
          </div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <ProductGridSkeleton count={4} columns="grid-cols-2 sm:grid-cols-2 lg:grid-cols-4" />
      </div>
    </div>
  );
};

/**
 * Service card skeleton for PrintingPage & OnlineServicesPage
 */
export const ServiceCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between h-full animate-pulse space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-20 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>

        <div className="space-y-2">
          <div className="w-3/4 h-5 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
          <div className="w-5/6 h-4 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>

        {/* Bullet checklist */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="w-4/5 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="w-24 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>
    </div>
  );
};

/**
 * Grid of service card skeletons
 */
export const ServiceGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Reusable Admin / Customer Table Skeleton
 */
export const TableSkeleton: React.FC<{
  columns?: number;
  rows?: number;
  headerLabels?: string[];
}> = ({ columns = 6, rows = 6, headerLabels }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 px-4 py-3.5 flex items-center gap-4">
        {headerLabels ? (
          headerLabels.map((lbl, idx) => (
            <div key={idx} className="flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {lbl}
            </div>
          ))
        ) : (
          Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="flex-1 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md" />
          ))
        )}
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} className="px-4 py-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, cIdx) => (
              <div key={cIdx} className="flex-1 space-y-1.5">
                <div
                  className={`h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md ${
                    cIdx === 0
                      ? 'w-4/5'
                      : cIdx === columns - 1
                      ? 'w-16 ml-auto'
                      : (rIdx + cIdx) % 2 === 0
                      ? 'w-3/4'
                      : 'w-2/3'
                  }`}
                />
                {cIdx === 0 && (
                  <div className="w-1/2 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * KPI Metric Card Skeleton for Admin and Overview pages
 */
export const KpiCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-24 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md" />
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="space-y-2">
        <div className="w-28 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="w-36 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
};

export const KpiGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
};

/**
 * Order Tracking Skeleton Loader
 */
export const OrderTrackingSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-md space-y-8 animate-pulse">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-amber-200 dark:bg-amber-900/40 rounded-full" />
            <div className="w-48 h-6 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
          <div className="w-56 h-3.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
        <div className="w-28 h-7 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Stepper Timeline */}
      <div className="py-2">
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex flex-col items-center text-center space-y-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="w-14 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Details Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <div className="w-32 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="w-32 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="w-3/5 h-4 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Activity log row skeleton for Admin Overview
 */
export const AuditLogRowSkeleton: React.FC = () => {
  return (
    <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
        <div className="space-y-1">
          <div className="w-36 h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
      <div className="w-16 h-3 bg-slate-100 dark:bg-slate-800 rounded-md" />
    </div>
  );
};
