'use client'

import type { ProductVariant } from '@/lib/types/database'

interface VariantListProps {
  variants: ProductVariant[]
}

export default function VariantList({ variants }: VariantListProps) {
  if (variants.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No variants added yet
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {variants.map((variant) => (
        <div
          key={variant.id}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <div>
            <p className="font-medium text-gray-900">
              Size {variant.size} • {variant.color}
            </p>
            {variant.barcode && (
              <p className="text-xs text-gray-500 font-mono">{variant.barcode}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
