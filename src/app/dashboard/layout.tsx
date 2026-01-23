import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@/lib/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // User exists in auth but not in users table
    // This should be handled during user creation
    return <div>Profile not found. Contact administrator.</div>
  }

  return <>{children}</>
}
