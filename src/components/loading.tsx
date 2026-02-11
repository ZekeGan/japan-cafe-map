// app/cafes/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-10">
      <div className="flex flex-col items-center gap-2">
        {/* 這裡可以用你喜歡的 Spinner 或 Skeleton */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-gray-500 animate-pulse">正在讀取...</p>
      </div>
    </div>
  )
}
