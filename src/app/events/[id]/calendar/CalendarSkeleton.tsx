/**
 * Calendar Skeleton Loading State
 */

import { Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAF7F4] py-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between rounded-2xl bg-white/60 px-6 py-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-pastel-lavender-100">
              <CalendarIcon className="size-5 animate-pulse text-pastel-lavender-600" />
            </div>
            <div>
              <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
              <div className="mt-1 h-4 w-64 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Filter Pills Skeleton */}
        <div className="rounded-2xl bg-white/60 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-9 w-24 animate-pulse rounded-xl bg-gray-200"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Calendar Skeleton */}
        <div className="rounded-2xl bg-white/60 p-6 shadow-sm backdrop-blur-sm">
          <div className="space-y-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-lg bg-gray-100"
                  style={{ animationDelay: `${i * 20}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
