'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (value: string) => {
    setQuery(value)
    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      if (value) {
        params.set('q', value)
      } else {
        params.delete('q')
      }
      router.push(`/inventory?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by brand, model, or barcode..."
        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent text-base text-black placeholder:text-gray-600"
      />
      <svg
        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {isPending && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full"></div>
        </div>
      )}
    </div>
  )
}
