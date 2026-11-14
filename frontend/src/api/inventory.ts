import { request } from './client'
import type { InventoryItem } from '@/types'

const LOCAL_INVENTORY_KEY = 'vinnyx_inventory_db'

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 1, sku: 'PAP-A4-CHM', name: 'Chamex A4 Paper Ream (500 sheets)', category: 'stationery', cost_price: 550, selling_price: 700, quantity_in_stock: 45, reorder_level: 15, unit: 'ream', is_active: true },
  { id: 2, sku: 'PAP-PHOTO-GLOSS', name: 'A4 Glossy Photo Paper (20 sheets)', category: 'stationery', cost_price: 250, selling_price: 400, quantity_in_stock: 12, reorder_level: 10, unit: 'pack', is_active: true },
  { id: 3, sku: 'FLS-32GB-SND', name: 'SanDisk 32GB USB Flash Drive', category: 'accessories', cost_price: 450, selling_price: 750, quantity_in_stock: 8, reorder_level: 5, unit: 'pcs', is_active: true },
  { id: 4, sku: 'FLS-64GB-SND', name: 'SanDisk 64GB USB 3.0 Flash Drive', category: 'accessories', cost_price: 700, selling_price: 1100, quantity_in_stock: 4, reorder_level: 5, unit: 'pcs', is_active: true },
  { id: 5, sku: 'TNR-HP-85A', name: 'HP LaserJet 85A Toner Cartridge', category: 'toner', cost_price: 1200, selling_price: 1800, quantity_in_stock: 3, reorder_level: 2, unit: 'pcs', is_active: true },
  { id: 6, sku: 'TNR-HP-78A', name: 'HP LaserJet 78A Toner Cartridge', category: 'toner', cost_price: 1300, selling_price: 1950, quantity_in_stock: 2, reorder_level: 2, unit: 'pcs', is_active: true },
  { id: 7, sku: 'CBL-USB-PRN', name: 'USB Printer Cable 1.5m', category: 'cables', cost_price: 120, selling_price: 250, quantity_in_stock: 15, reorder_level: 5, unit: 'pcs', is_active: true },
  { id: 8, sku: 'MOU-OPT-USB', name: 'Optical USB Mouse (Dell/HP)', category: 'hardware', cost_price: 300, selling_price: 550, quantity_in_stock: 7, reorder_level: 4, unit: 'pcs', is_active: true },
  { id: 9, sku: 'ENV-A4-BRN', name: 'A4 Brown Document Envelopes (Pack of 50)', category: 'stationery', cost_price: 300, selling_price: 500, quantity_in_stock: 6, reorder_level: 4, unit: 'pack', is_active: true },
  { id: 10, sku: 'BND-SPRL-12MM', name: 'Spiral Binding Combs 12mm (100 pcs)', category: 'stationery', cost_price: 450, selling_price: 750, quantity_in_stock: 2, reorder_level: 3, unit: 'box', is_active: true },
]

function getLocal(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_INVENTORY_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_INVENTORY
  } catch {
    return DEFAULT_INVENTORY
  }
}

function saveLocal(items: InventoryItem[]) {
  localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(items))
}

export const inventoryApi = {
  async getItems(): Promise<InventoryItem[]> {
    try {
      const data = await request<InventoryItem[]>('/inventory')
      return Array.isArray(data) ? data : getLocal()
    } catch {
      return getLocal()
    }
  },

  async adjustStock(id: number, deltaQuantity: number, reason: string): Promise<InventoryItem> {
    try {
      return await request<InventoryItem>(`/inventory/${id}/adjust`, {
        method: 'POST',
        body: JSON.stringify({ deltaQuantity, reason }),
      })
    } catch {
      const items = getLocal()
      const updated = items.map((it) => {
        if (it.id === id) {
          return { ...it, quantity_in_stock: Math.max(0, it.quantity_in_stock + deltaQuantity) }
        }
        return it
      })
      saveLocal(updated)
      return updated.find((it) => it.id === id)!
    }
  },

  async addItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    try {
      return await request<InventoryItem>('/inventory', {
        method: 'POST',
        body: JSON.stringify(item),
      })
    } catch {
      const items = getLocal()
      const newItem: InventoryItem = {
        id: Date.now(),
        ...item,
      }
      saveLocal([newItem, ...items])
      return newItem
    }
  },
}
