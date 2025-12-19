'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function DataCenterHeader() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Data Center', href: '/data-center' },
  ]

  // Hide header in Model Editor to provide full-screen immersive experience (as per mockup)
  if (pathname.includes('/model-editor/')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mr-12 flex items-center gap-2 text-base font-bold text-foreground">
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        LowCode Engine
      </div>
      <nav className="flex h-full gap-6 text-sm font-medium">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-full items-center border-b-2 border-transparent transition-colors hover:text-foreground/80',
                isActive ? 'border-accent text-foreground' : 'text-foreground/60'
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
