import clsx from 'clsx'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={clsx('skeleton-bone rounded-lg', className)} />
}

export function CartItemSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/8 bg-panel p-4 sm:flex-row sm:items-start">
      <Skeleton className="h-28 w-28 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
