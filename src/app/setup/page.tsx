'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setupProfile()
  }, [])

  const setupProfile = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        setError('Not authenticated. Please login first.')
        setLoading(false)
        return
      }

      setUserInfo(user)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        setSuccess(true)
        setLoading(false)
        setTimeout(() => router.push('/dashboard'), 2000)
        return
      }

      // Create or get Main Store
      let { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('name', 'Main Store')
        .single()

      if (!store) {
        const { data: newStore, error: storeError } = await supabase
          .from('stores')
          .insert({
            name: 'Main Store',
            city: 'Mumbai',
            phone: '+91-0000000000',
            is_active: true
          })
          .select()
          .single()

        if (storeError) {
          setError(`Store creation failed: ${storeError.message}`)
          setLoading(false)
          return
        }
        store = newStore
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          role: 'owner',
          store_id: store?.id || null,
          is_active: true
        })

      if (profileError) {
        setError(`Profile creation failed: ${profileError.message}`)
        setLoading(false)
        return
      }

      setSuccess(true)
      setLoading(false)
      setTimeout(() => router.push('/dashboard'), 2000)

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <h2 className="text-xl font-bold mt-4">Setting up your profile...</h2>
          <p className="text-gray-600 mt-2 text-sm">Please wait</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-green-600">Profile Created Successfully!</h2>
          <p className="text-gray-600 mt-2 text-sm">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold text-red-600 mb-4">Setup Failed</h2>
        
        {userInfo && (
          <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
            <p><strong>User ID:</strong> {userInfo.id}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </div>
        )}

        <div className="bg-red-50 border border-red-200 p-4 rounded mb-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-4">
          <p className="text-sm font-semibold mb-2">Manual Fix Required:</p>
          <p className="text-xs mb-2">Run this in Supabase SQL Editor:</p>
          <pre className="bg-gray-900 text-white p-2 rounded text-xs overflow-x-auto">
{`-- Temporarily disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Insert your profile
INSERT INTO users (id, email, full_name, role, store_id, is_active)
VALUES (
  '${userInfo?.id}'::uuid,
  '${userInfo?.email}',
  '${userInfo?.email?.split('@')[0] || 'User'}',
  'owner',
  (SELECT id FROM stores WHERE name = 'Main Store' LIMIT 1),
  TRUE
);

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;`}
          </pre>
        </div>

        <button
          onClick={() => setupProfile()}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 mb-2"
        >
          Try Again
        </button>

        <button
          onClick={() => router.push('/login')}
          className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
