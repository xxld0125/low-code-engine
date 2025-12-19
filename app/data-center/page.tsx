'use client'

import { ModelList } from '@/components/data-center/ModelList'
import { CreateModelDialog } from '@/components/data-center/CreateModelDialog'

export default function DataCenterPage() {
  return (
    <div className="mx-auto h-[calc(100vh-64px)] w-full max-w-[1200px] overflow-y-auto bg-background p-12">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-[24px] font-bold leading-none text-foreground">Data Models</h1>
          <p className="text-[14px] text-muted-foreground">
            Define and manage your application&apos;s data structure.
          </p>
        </div>
        <CreateModelDialog />
      </div>

      <ModelList />
    </div>
  )
}
