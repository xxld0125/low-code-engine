import { Suspense } from 'react'
import { DataCenterHeader } from '@/components/data-center/Header'

export default function DataCenterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <Suspense fallback={<div className="h-14 border-b bg-background" />}>
        <DataCenterHeader />
      </Suspense>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
