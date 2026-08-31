import clsx from 'clsx'
import { CartItemSkeleton, Skeleton } from './Skeleton'

function CommerceHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-2">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-4 w-72" />
    </div>
  )
}

export function CartPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CommerceHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          <CartItemSkeleton />
          <CartItemSkeleton />
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  )
}

export function CollectionsPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CommerceHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-panel p-4">
            <Skeleton className="mb-3 h-36 rounded-xl" />
            <Skeleton className="mb-2 h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CommerceHeaderSkeleton />
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    </div>
  )
}

export function OrderConfirmSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]', className)}>
      <div className="space-y-6">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-40 rounded-[20px]" />
        <Skeleton className="h-48 rounded-[20px]" />
      </div>
      <Skeleton className="h-96 rounded-[20px]" />
    </div>
  )
}

export function CommercePageSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <CommerceHeaderSkeleton />
      <div className="space-y-3">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    </div>
  )
}
