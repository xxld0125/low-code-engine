import { AuthButton } from '@/components/auth-button'
import Link from 'next/link'
import { Suspense } from 'react'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background">
      <div className="flex w-full flex-1 flex-col items-center">
        <nav className="flex h-16 w-full justify-center border-b-2 border-b-foreground">
          <div className="flex w-full max-w-5xl items-center justify-between px-8 text-[13px]">
            <div className="flex items-center gap-5 font-semibold">
              <Link href={'/'} className="transition-colors hover:text-accent">
                Low-Code Engine
              </Link>
            </div>
            <Suspense>
              <AuthButton />
            </Suspense>
          </div>
        </nav>
        <div className="flex w-full max-w-5xl flex-1 flex-col px-8 py-16">{children}</div>

        <footer className="mx-auto flex w-full items-center justify-center gap-8 border-t-2 border-t-foreground py-12 text-center text-xs">
          <p>
            Powered by{' '}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold transition-colors hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
