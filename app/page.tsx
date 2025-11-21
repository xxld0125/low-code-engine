import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Low-Code Engine</h1>
      <p className="text-muted-foreground">Build powerful applications with ease.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/protected">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="https://github.com/your-repo" target="_blank">
            GitHub
          </Link>
        </Button>
      </div>
    </div>
  )
}
