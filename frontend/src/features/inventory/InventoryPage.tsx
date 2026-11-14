import React, { useState, useEffect } from 'react'
import { inventoryApi } from '@/api/inventory'
import type { InventoryItem } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { formatKES } from '@/lib/utils'
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Boxes,
  TrendingUp,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react'

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null)
  const [adjustDelta, setAdjustDelta] = useState<number>(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [loading, setLoading] = useState(false)

  // New item form state
  const [newItem, setNewItem] = useState({
    sku: '',
    name: '',
    category: 'stationery' as InventoryItem['category'],
    cost_price: 0,
    selling_price: 0,
    quantity_in_stock: 0,
    reorder_level: 5,
    unit: 'pcs',
    is_active: true,
  })

  useEffect(() => {
    inventoryApi.getItems().then(setItems)
  }, [])

  const categories = ['all', 'stationery', 'accessories', 'toner', 'cables', 'hardware']

  const filteredItems = items.filter((it) => {
    const matchesCat = selectedCategory === 'all' || it.category === selectedCategory
    const matchesQuery =
      it.name.toLowerCase().includes(search.toLowerCase()) ||
      it.sku.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesQuery
  })

  const lowStockCount = items.filter((it) => it.quantity_in_stock <= it.reorder_level).length
  const totalCostValue = items.reduce((acc, it) => acc + it.cost_price * it.quantity_in_stock, 0)
  const totalRetailValue = items.reduce((acc, it) => acc + it.selling_price * it.quantity_in_stock, 0)

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adjustItem || adjustDelta === 0) return
    setLoading(true)
    try {
      const updated = await inventoryApi.adjustStock(adjustItem.id, adjustDelta, adjustReason)
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)))
      setAdjustItem(null)
      setAdjustDelta(0)
      setAdjustReason('')
    } finally {
      setLoading(false)
    }
  }

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItem.name || !newItem.sku) return
    setLoading(true)
    try {
      const added = await inventoryApi.addItem(newItem)
      setItems([added, ...items])
      setIsAddOpen(false)
      setNewItem({
        sku: '',
        name: '',
        category: 'stationery',
        cost_price: 0,
        selling_price: 0,
        quantity_in_stock: 0,
        reorder_level: 5,
        unit: 'pcs',
        is_active: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Inventory & Stock Management</span>
              {lowStockCount > 0 && (
                <Badge variant="warning">{lowStockCount} Low Stock</Badge>
              )}
            </h1>
            <p className="text-xs text-gray-500">
              Track stationery reams, flash disks, cartridges, and hardware accessories.
            </p>
          </div>

          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Stock Item
          </Button>
        </div>

        {/* Valuation KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Stock Items
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-gray-900">{items.length} SKUs</span>
              <Boxes className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {items.reduce((acc, it) => acc + it.quantity_in_stock, 0)} units in branch warehouse
            </span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block">
              Inventory Cost Value
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-slate-800">{formatKES(totalCostValue)}</span>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Purchased capital locked in stock</span>
          </Card>

          <Card className="p-4 bg-white shadow-xs">
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
              Retail Realization Value
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xl font-extrabold text-blue-700">{formatKES(totalRetailValue)}</span>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-[11px] text-blue-700 mt-1 block">
              Est. Profit Margin: {formatKES(Math.max(0, totalRetailValue - totalCostValue))}
            </span>
          </Card>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap capitalize transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stock List Table */}
        <Card className="shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-gray-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Warehouse Catalog</CardTitle>
            <span className="text-xs text-gray-400">Showing {filteredItems.length} items</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">SKU</th>
                    <th className="px-4 py-2.5 font-semibold">Item Name</th>
                    <th className="px-4 py-2.5 font-semibold">Category</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Cost Price</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Selling Price</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Stock Level</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.map((item) => {
                    const isLow = item.quantity_in_stock <= item.reorder_level
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-gray-600 whitespace-nowrap">
                          {item.sku}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-gray-900 block">{item.name}</span>
                          <span className="text-[10px] text-gray-400">Unit: {item.unit}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="neutral" className="capitalize">
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {formatKES(item.cost_price)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                          {formatKES(item.selling_price)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <span
                              className={`font-extrabold ${
                                isLow ? 'text-rose-600' : 'text-gray-900'
                              }`}
                            >
                              {item.quantity_in_stock} {item.unit}
                            </span>
                            {isLow && (
                              <span title={`Reorder alert: At or below ${item.reorder_level}`}>
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-500 inline" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdjustItem(item)}
                          >
                            <ArrowUpDown className="h-3 w-3 mr-1" /> Adjust Stock
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Adjust Stock Dialog */}
        <Dialog
          isOpen={!!adjustItem}
          onClose={() => setAdjustItem(null)}
          title={`Adjust Stock: ${adjustItem?.name}`}
          description={`Current warehouse quantity: ${adjustItem?.quantity_in_stock} ${adjustItem?.unit}`}
          maxWidth="sm"
        >
          {adjustItem && (
            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <Input
                label="Stock Quantity Delta (+ for incoming, - for damaged/outgoing)"
                type="number"
                value={adjustDelta || ''}
                onChange={(e) => setAdjustDelta(Number(e.target.value))}
                helperText={`New quantity will be: ${Math.max(
                  0,
                  adjustItem.quantity_in_stock + adjustDelta
                )} ${adjustItem.unit}`}
                required
              />

              <Input
                label="Reason / Purchase Order Ref"
                placeholder="e.g. Received new stock delivery invoice #8812"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setAdjustItem(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={loading}>
                  Save Adjustment
                </Button>
              </div>
            </form>
          )}
        </Dialog>

        {/* Add New Stock Item Dialog */}
        <Dialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add New Stock Item"
          description="Register a new retail product or consumable for point-of-sale inventory tracking"
          maxWidth="md"
        >
          <form onSubmit={handleAddItemSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="SKU / Barcode"
                placeholder="e.g. FLS-128GB"
                value={newItem.sku}
                onChange={(e) => setNewItem({ ...newItem, sku: e.target.value.toUpperCase() })}
                required
              />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500"
                >
                  <option value="stationery">Stationery</option>
                  <option value="accessories">Accessories</option>
                  <option value="toner">Toner / Ink Cartridge</option>
                  <option value="cables">Cables & Chargers</option>
                  <option value="hardware">Hardware</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <Input
              label="Item Name"
              placeholder="e.g. SanDisk 128GB Flash Drive"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Cost Price (KES)"
                type="number"
                min="0"
                value={newItem.cost_price || ''}
                onChange={(e) => setNewItem({ ...newItem, cost_price: Number(e.target.value) })}
                required
              />

              <Input
                label="Selling Retail Price (KES)"
                type="number"
                min="0"
                value={newItem.selling_price || ''}
                onChange={(e) => setNewItem({ ...newItem, selling_price: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Initial Quantity"
                type="number"
                min="0"
                value={newItem.quantity_in_stock || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity_in_stock: Number(e.target.value) })}
                required
              />

              <Input
                label="Reorder Level"
                type="number"
                min="1"
                value={newItem.reorder_level || ''}
                onChange={(e) => setNewItem({ ...newItem, reorder_level: Number(e.target.value) })}
                required
              />

              <Input
                label="Unit of Measure"
                placeholder="pcs / ream / pack"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" isLoading={loading}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> Save Item
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  )
}
