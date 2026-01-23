import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import VariantForm from '@/components/VariantForm'

interface NewVariantPageProps {
  params: Promise<{ id: string }>
}

export default async function NewVariantPage({ params }: NewVariantPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['owner', 'manager'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <a href={`/products/${id}`} className="text-blue-600 text-sm">← Back</a>
          <h1 className="text-xl font-bold text-gray-900 mt-2">Add Variant</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <VariantForm productId={id} />
      </main>
    </div>
  )
}
