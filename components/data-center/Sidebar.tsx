'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Database, Home, Settings } from 'lucide-react'

export function DataCenterSidebar() {
  const pathname = usePathname()

  const links = [
    {
      label: 'Models',
      href: '/data-center',
      icon: Database,
      active: pathname === '/data-center' || pathname.startsWith('/data-center/model'),
    },
    {
      label: 'Settings',
      href: '/data-center/settings',
      icon: Settings,
      active: pathname.startsWith('/data-center/settings'),
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-[var(--background)]">
      <div className="flex items-center gap-2 border-b p-6">
        <Home className="h-6 w-6 text-[var(--accent)]" />
        <span className="text-lg font-bold">Data Engine</span>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              link.active
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--foreground)] hover:bg-[var(--secondary)]'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">v1.1.0 Core Check</div>
    </div>
  )
}
