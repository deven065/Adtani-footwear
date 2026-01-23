export type UserRole = 'owner' | 'manager' | 'staff'
export type StockEventType = 'NEW_STOCK' | 'SALE' | 'RETURN' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT'
export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  store_id: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  name: string
  address: string | null
  city: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  brand: string
  model_name: string
  category: string
  description: string | null
  sku: string | null
  barcode: string | null
  mrp: number | null
  cost_price: number | null
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string
  color: string
  sku: string | null
  barcode: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  variant_id: string
  store_id: string
  quantity: number
  last_updated: string
}

export interface StockMovement {
  id: string
  variant_id: string
  store_id: string
  event_type: StockEventType
  quantity_change: number
  price_per_unit: number | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface StockTransfer {
  id: string
  variant_id: string
  from_store_id: string
  to_store_id: string
  quantity: number
  status: TransferStatus
  requested_by: string | null
  approved_by: string | null
  completed_by: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InventoryWithDetails extends Inventory {
  store_name: string
  brand: string
  model_name: string
  category: string
  mrp: number | null
  size: string
  color: string
  barcode: string | null
}
