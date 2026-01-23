'use client'

interface StoreSelectorProps {
  storeName: string
}

export default function StoreSelector({ storeName }: StoreSelectorProps) {
  return (
    <div className="bg-gray-100 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-600">Store: </span>
      <span className="text-sm font-medium text-gray-900">{storeName}</span>
    </div>
  )
}
