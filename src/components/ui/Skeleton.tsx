import { cn } from '@/lib/utils'

interface SkeletonLineProps {
  h?: string
  w?: string
  className?: string
}

export function SkeletonLine({ h = 'h-4', w = 'w-full', className }: SkeletonLineProps) {
  return (
    <div className={cn('animate-pulse bg-gray-200 rounded', h, w, className)} />
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-4 border border-border rounded-xl space-y-3', className)}>
      <SkeletonLine h="h-5" w="w-3/5" />
      <SkeletonLine h="h-3" w="w-full" />
      <SkeletonLine h="h-3" w="w-4/5" />
    </div>
  )
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-start gap-4 p-4 bg-card border border-border rounded-xl', className)}>
      <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <SkeletonLine h="h-7" w="w-16" />
        <SkeletonLine h="h-3" w="w-24" />
      </div>
    </div>
  )
}

export function SkeletonRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 py-3 px-4 border-b border-border', className)}>
      {Array.from({ length: cols }).map((_, i) => (
        <SkeletonLine
          key={i}
          h="h-4"
          w={i === 0 ? 'w-2/5' : 'w-1/5'}
          className={i === cols - 1 ? 'ml-auto' : ''}
        />
      ))}
    </div>
  )
}
