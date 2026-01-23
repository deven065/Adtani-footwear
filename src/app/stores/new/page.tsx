import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StoreForm from '@/components/StoreForm'

export default async function NewStorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'owner') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <a href="/stores" className="text-blue-600 text-sm">← Back</a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Add New Store</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <StoreForm />
      </main>
    </div>
  )
}
