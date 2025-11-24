export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#F4EFEA]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#16AA98] border-t-transparent" />
      <p className="animate-pulse text-sm font-medium text-[#383838]">Loading Editor...</p>
    </div>
  )
}
