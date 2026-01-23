'use client'

import Link from 'next/link'
import type { InventoryWithDetails, UserRole } from '@/lib/types/database'

interface InventoryListProps {
  items: InventoryWithDetails[]
  userRole: UserRole
  showStoreInfo?: boolean
}

export default function InventoryList({ items, userRole, showStoreInfo = false }: InventoryListProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/inventory/${item.variant_id}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow active:scale-98"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{item.brand}</h3>
              <p className="text-gray-600 text-sm">{item.model_name}</p>
              <div className="flex gap-3 mt-2 text-sm text-gray-500">
                <span>Size: {item.size}</span>
                <span>•</span>
                <span>{item.color}</span>
              </div>
              {(userRole !== 'staff' || showStoreInfo) && (
                <div className="mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{item.store_name}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-right ml-4">
              <div className={`text-2xl font-bold ${
                item.quantity > 10
                  ? 'text-green-600'
                  : item.quantity > 5
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {item.quantity}
              </div>
              <p className="text-xs text-gray-500">in stock</p>
              {item.mrp && (
                <p className="text-sm text-gray-600 mt-1">₹{item.mrp}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
