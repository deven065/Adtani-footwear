'use client'

import Link from 'next/link'
import type { InventoryWithDetails, UserRole } from '@/lib/types/database'

interface InventoryListProps {
  items: InventoryWithDetails[]
  userRole: UserRole
}

export default function InventoryList({ items, userRole }: InventoryListProps) {
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
              {userRole !== 'staff' && (
                <p className="text-xs text-gray-500 mt-1">{item.store_name}</p>
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
