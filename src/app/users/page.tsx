'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

interface Store {
  id: string
  name: string
  location: string
  phone: string | null
}

interface User {
  id: string
  email: string
  full_name: string
  role: 'owner' | 'manager' | 'staff'
  is_active: boolean
  phone: string | null
  store_id: string | null
  stores: Store | null
}

export default function UsersPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [profile, setProfile] = useState<User | null>(null)

  useEffect(() => {
    async function loadData() {
      // Check auth
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user profile
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData || profileData.role !== 'owner') {
        router.push('/dashboard')
        return
      }

      setProfile(profileData)

      // Get all users with their store info
      const { data: usersData } = await supabase
        .from('users')
        .select('*, stores(*)')
        .order('role', { ascending: true })
        .order('full_name', { ascending: true })

      setUsers(usersData || [])

      // Get all stores for dropdown
      const { data: storesData } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      setStores(storesData || [])
      setLoading(false)
    }

    loadData()
  }, [router, supabase])

  const handleStoreAssignment = async (userId: string, storeId: string | null) => {
    await supabase
      .from('users')
      .update({ store_id: storeId })
      .eq('id', userId)

    // Refresh users list
    const { data: usersData } = await supabase
      .from('users')
      .select('*, stores(*)')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true })

    setUsers(usersData || [])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Manage Users</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">Assign stores to staff and managers</p>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="space-y-4">
          {users?.map((userItem: any) => (
            <div key={userItem.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{userItem.full_name}</h3>
                  <p className="text-sm text-gray-600">{userItem.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userItem.role === 'owner' ? 'bg-purple-100 text-purple-800' :
                      userItem.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {userItem.role === 'owner' ? 'Admin/Owner' : userItem.role.charAt(0).toUpperCase() + userItem.role.slice(1)}
                    </span>
                    {userItem.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Assignment */}
              <div className="border-t border-gray-200 pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Store
                </label>
                {userItem.role === 'owner' ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm font-medium text-purple-900">Access to All Stores</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <select
                        value={userItem.store_id || ''}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-sm text-gray-900"
                        onChange={(e) => {
                          const newStoreId = e.target.value || null
                          handleStoreAssignment(userItem.id, newStoreId)
                        }}
                      >
                        <option value="">No store assigned</option>
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>
                            {store.name} - {store.location}
                          </option>
                        ))}
                      </select>
                    </div>
                    {userItem.stores && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Currently: {userItem.stores.name}</span>
                        {userItem.stores.phone && (
                          <>
                            <span>•</span>
                            <span>{userItem.stores.phone}</span>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found
            </div>
          )}
        </div>
      </main>

      <Navigation role={profile?.role || 'staff'} />
    </div>
  )
}
