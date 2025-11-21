import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InfoIcon } from 'lucide-react'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function UserDetails() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <pre className="max-h-64 overflow-auto border-2 border-foreground bg-card p-6 font-mono text-xs">
      {JSON.stringify(data.user, null, 2)}
    </pre>
  )
}

export default function ProtectedPage() {
  return (
    <div className="flex w-full flex-1 flex-col gap-16">
      <div className="w-full">
        <div className="flex items-center gap-3 border-2 border-accent bg-accent/10 p-6 text-sm">
          <InfoIcon size="20" strokeWidth={2} className="text-accent" />
          <span className="font-medium">
            This is a protected page that you can only see as an authenticated user
          </span>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Your User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="text-muted-foreground">Loading user details...</div>}>
            <UserDetails />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
