import React, { useState, useEffect } from 'react'
import { shopApi } from '@/api/shop'
import { salesApi } from '@/api/sales'
import type { ShopProduct, SaleLineItem, Sale, Payment } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { SplitPayment } from '@/features/payments/SplitPayment'
import { formatKES } from '@/lib/utils'
import {
  Laptop,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Printer,
  Search,
  Cpu,
} from 'lucide-react'

export const ElectronicsPosPage: React.FC = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [cart, setCart] = useState<SaleLineItem[]>([])
  const [search, setSearch] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  useEffect(() => {
    shopApi.getProducts('all').then((list) => {
      // Filter for electronics & hardware tools
      setProducts(list.filter((p) => p.category === 'electronics' || p.category === 'printers' || p.category === 'cyber_tools'))
    })
  }, [])

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  const addToCart = (product: ShopProduct) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.service_id === product.id)
      if (existing) {
        return prev.map((it) => {
          if (it.service_id === product.id) {
            const nextQty = it.quantity + 1
            const nextTotal = nextQty * it.unit_price
            return {
              ...it,
              quantity: nextQty,
              total_price: nextTotal,
              commission_amount: (nextTotal * 5) / 100, // 5% retail commission
            }
          }
          return it
        })
      }
      return [
        ...prev,
        {
          service_id: product.id,
          service_name: `[${product.sku}] ${product.name}`,
          quantity: 1,
          unit_price: product.price,
          total_price: product.price,
          commission_rate: 5,
          commission_amount: (product.price * 5) / 100,
          teller_id: user?.id,
        },
      ]
    })
  }

  const updateQuantity = (serviceId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.service_id === serviceId) {
            const nextQty = it.quantity + delta
            if (nextQty <= 0) return null
            const nextTotal = nextQty * it.unit_price
            return {
              ...it,
              quantity: nextQty,
              total_price: nextTotal,
              commission_amount: (nextTotal * 5) / 100,
            }
          }
          return it
        })
        .filter(Boolean) as SaleLineItem[]
    )
  }

  const removeItem = (serviceId: number) => {
    setCart((prev) => prev.filter((i) => i.service_id !== serviceId))
  }

  const subtotal = cart.reduce((acc, it) => acc + it.total_price, 0)

  const handlePaymentSuccess = async (payments: Payment[]) => {
    setIsPaymentOpen(false)
    const salePayload = {
      branch_id: 1,
      customer_name: customerName.trim() || 'Walk-in Electronics Buyer',
      customer_phone: customerPhone.trim() || undefined,
      items: cart,
      payments,
    }

    try {
      const created = await salesApi.createSale(salePayload)
      setCompletedSale(created)
      setIsReceiptOpen(true)
      setCart([])
      setCustomerName('')
      setCustomerPhone('')
    } catch (err: any) {
      alert('Failed to register sale: ' + (err?.message || 'Unknown error'))
    }
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-gray-100 font-sans">
      {/* Left: Electronics Catalog */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-600" />
              <span>Electronics & Hardware Equipment POS</span>
              <Badge variant="warning">Teller #{user?.teller_number || '10/11'}</Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Dedicated counter for Laptops, SSDs, Flash drives, Printers & Hardware sales.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search electronics by SKU or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Electronics Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((prod) => (
              <button
                key={prod.id}
                type="button"
                onClick={() => addToCart(prod)}
                className="group p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-gray-500 font-bold">{prod.sku}</span>
                    <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-semibold capitalize">
                      {prod.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 group-hover:text-blue-700 leading-snug">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-extrabold text-blue-700">
                    {formatKES(prod.price)}
                  </span>
                  <div className="h-6 w-6 rounded-full bg-gray-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center text-gray-600 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col h-auto lg:h-full shadow-lg">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-sm">Electronics Order</h2>
            <Badge variant="neutral">{cart.reduce((a, b) => a + b.quantity, 0)} items</Badge>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Customer fields */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-2 text-xs">
          <input
            type="text"
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-2 py-1.5 bg-white rounded border border-gray-200 text-xs"
          />
          <input
            type="tel"
            placeholder="07... (Receipt/Warranty)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-2 py-1.5 bg-white rounded border border-gray-200 text-xs"
          />
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Laptop className="h-10 w-10 text-gray-300 mb-2 stroke-1" />
              <p className="text-xs font-semibold text-gray-600">Cart is empty</p>
              <p className="text-[11px] text-gray-400">Select electronics equipment to invoice</p>
            </div>
          ) : (
            cart.map((it) => (
              <div
                key={it.service_id}
                className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 space-y-1.5 text-xs"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-gray-900 leading-snug">{it.service_name}</span>
                  <span className="font-black text-gray-900">{formatKES(it.total_price)}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-gray-200 rounded-md bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.service_id, -1)}
                      className="p-1 text-gray-500"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 font-bold">{it.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(it.service_id, 1)}
                      className="p-1 text-gray-500"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(it.service_id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-3">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-semibold text-gray-600">Total Due:</span>
            <span className="text-xl font-extrabold text-blue-700">{formatKES(subtotal)}</span>
          </div>

          <Button
            variant="primary"
            size="lg"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full shadow-md py-3 text-sm font-bold"
          >
            Collect Payment ({formatKES(subtotal)})
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Collect Electronics Payment"
        maxWidth="lg"
      >
        <SplitPayment
          totalAmount={subtotal}
          onComplete={handlePaymentSuccess}
          onCancel={() => setIsPaymentOpen(false)}
        />
      </Dialog>

      {/* Printable Receipt */}
      <Dialog
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Electronics Warranty Receipt"
        maxWidth="sm"
      >
        {completedSale && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-xs text-gray-800 space-y-2">
              <div className="text-center border-b border-dashed pb-2">
                <h4 className="font-bold text-sm">Vinnyx Technologies</h4>
                <p className="text-[10px]">Electronics & Hardware Counter (Teller 10/11)</p>
                <p className="text-[10px]">Warranty & Sales Receipt: {completedSale.sale_number}</p>
              </div>

              <div className="border-b border-dashed pb-2 space-y-1">
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{it.quantity}x {it.service_name}</span>
                    <span>{formatKES(it.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-bold border-b border-dashed pb-2">
                <span>TOTAL PAID:</span>
                <span>{formatKES(completedSale.total)}</span>
              </div>

              <div className="text-[9px] text-gray-500 text-center pt-1">
                <p>Retain this receipt for 6-month hardware warranty.</p>
                <p>Support / WhatsApp: 0750 280 280</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.print()} className="flex-1">
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="primary" onClick={() => setIsReceiptOpen(false)} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
