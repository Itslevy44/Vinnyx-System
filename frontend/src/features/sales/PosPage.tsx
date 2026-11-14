import React, { useState, useEffect } from 'react'
import { salesApi } from '@/api/sales'
import type { ServiceItem, SaleLineItem, Sale, Payment } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog } from '@/components/ui/Dialog'
import { SplitPayment } from '@/features/payments/SplitPayment'
import { formatKES, formatDate } from '@/lib/utils'
import {
  Printer,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  Receipt,
  User,
  Phone,
  Tag,
  RotateCcw,
  History,
  Coins,
} from 'lucide-react'

export const PosPage: React.FC = () => {
  const { user } = useAuth()
  const [services, setServices] = useState<ServiceItem[]>([])
  const [cart, setCart] = useState<SaleLineItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [discount, setDiscount] = useState<number>(0)

  // Payment modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Recent sales view
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)

  useEffect(() => {
    salesApi.getServices().then(setServices)
    salesApi.getSales().then(setRecentSales)
  }, [])

  const categories = ['all', 'printing', 'cyber', 'design', 'eulogy', 'laminating']

  const filteredServices = services.filter((srv) => {
    const matchesCategory = selectedCategory === 'all' || srv.category === selectedCategory
    const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const addToCart = (service: ServiceItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.service_id === service.id)
      if (existing) {
        return prev.map((item) => {
          if (item.service_id === service.id) {
            const newQty = item.quantity + 1
            const newTotal = newQty * item.unit_price
            const commAmt = (newTotal * item.commission_rate) / 100
            return {
              ...item,
              quantity: newQty,
              total_price: newTotal,
              commission_amount: commAmt,
            }
          }
          return item
        })
      }

      const total = service.price
      const commRate = service.default_commission_rate || 10
      const commAmt = (total * commRate) / 100
      const newItem: SaleLineItem = {
        service_id: service.id,
        service_name: service.name,
        quantity: 1,
        unit_price: service.price,
        total_price: total,
        commission_rate: commRate,
        commission_amount: commAmt,
        teller_id: user?.id,
      }
      return [...prev, newItem]
    })
  }

  const updateQuantity = (serviceId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.service_id === serviceId) {
            const newQty = item.quantity + delta
            if (newQty <= 0) return null
            const newTotal = newQty * item.unit_price
            const commAmt = (newTotal * item.commission_rate) / 100
            return {
              ...item,
              quantity: newQty,
              total_price: newTotal,
              commission_amount: commAmt,
            }
          }
          return item
        })
        .filter(Boolean) as SaleLineItem[]
    )
  }

  const removeItem = (serviceId: number) => {
    setCart((prev) => prev.filter((it) => it.service_id !== serviceId))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setCustomerName('')
    setCustomerPhone('')
  }

  const subtotal = cart.reduce((acc, it) => acc + it.total_price, 0)
  const totalCommission = cart.reduce((acc, it) => acc + it.commission_amount, 0)
  const totalAmount = Math.max(0, subtotal - discount)

  const handleCheckoutClick = () => {
    if (cart.length === 0) return
    setIsPaymentOpen(true)
  }

  const handlePaymentSuccess = async (payments: Payment[]) => {
    setIsPaymentOpen(false)
    const salePayload = {
      branch_id: 1,
      customer_name: customerName.trim() || 'Walk-in Customer',
      customer_phone: customerPhone.trim() || undefined,
      items: cart,
      discount,
      payments,
    }

    try {
      const created = await salesApi.createSale(salePayload)
      setCompletedSale(created)
      setIsReceiptOpen(true)
      clearCart()
      salesApi.getSales().then(setRecentSales)
    } catch (err: any) {
      alert('Failed to save sale: ' + (err?.message || 'Unknown error'))
    }
  }

  const handleVoidSale = async (saleId: string) => {
    if (!window.confirm('Are you sure you want to void this sale? This will reverse commissions and mark the sale as voided.')) {
      return
    }
    await salesApi.voidSale(saleId, 'Customer cancellation / teller mistake')
    salesApi.getSales().then(setRecentSales)
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-gray-100">
      {/* LEFT: Catalog and Services */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <span>Stationery & Cyber Services POS</span>
              <Badge variant="info">Branch #01</Badge>
            </h1>
            <p className="text-xs text-gray-500">
              Station: <strong className="text-gray-800">{user?.name}</strong> • Role: {user?.role.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="text-gray-700 bg-white"
            >
              <History className="h-4 w-4 mr-1 text-gray-500" /> Recent Sales ({recentSales.length})
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors capitalize ${
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

        {/* Services Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => addToCart(service)}
                className="group relative flex flex-col justify-between p-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {service.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {service.default_commission_rate}% Comm
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2">
                    {service.name}
                  </h4>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {formatKES(service.price)}
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

      {/* RIGHT: Current Cart / Checkout Side Panel */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col h-auto lg:h-full shadow-lg">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-sm">Active Order</h2>
            <Badge variant="neutral">{cart.reduce((a, b) => a + b.quantity, 0)} items</Badge>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Customer Info (Optional) */}
        <div className="p-3 bg-gray-50 border-b border-gray-200 grid grid-cols-2 gap-2 text-xs">
          <div className="relative">
            <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-white rounded border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="tel"
              placeholder="07... (For M-Pesa / SMS)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full pl-8 pr-2 py-1.5 bg-white rounded border border-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <ShoppingCart className="h-10 w-10 text-gray-300 mb-2 stroke-1" />
              <p className="text-xs font-medium text-gray-600">Cart is empty</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click services from the catalog to add items</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.service_id}
                className="p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-semibold text-gray-900 leading-snug">
                      {item.service_name}
                    </h5>
                    <span className="text-[10px] text-gray-400">
                      {formatKES(item.unit_price)} each • Comm: {formatKES(item.commission_amount)} ({item.commission_rate}%)
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {formatKES(item.total_price)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center border border-gray-200 rounded-md bg-white">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.service_id, -1)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-2 text-xs font-semibold text-gray-800">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.service_id, 1)}
                      className="p-1 text-gray-500 hover:text-gray-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.service_id)}
                    className="text-gray-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation Summary & Checkout button */}
        <div className="p-4 border-t border-gray-200 bg-gray-50/80 space-y-3">
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">{formatKES(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-gray-600">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3 text-gray-400" /> Discount (KES)
              </span>
              <input
                type="number"
                min="0"
                max={subtotal}
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-20 text-right py-0.5 px-1.5 bg-white border border-gray-300 rounded text-xs"
              />
            </div>

            <div className="flex justify-between text-[11px] text-blue-700 bg-blue-50 px-2 py-1 rounded">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3" /> Teller Earned Commission
              </span>
              <span className="font-semibold">{formatKES(totalCommission)}</span>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Payable</span>
              <span className="text-xl font-extrabold text-blue-700">
                {formatKES(totalAmount)}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={cart.length === 0}
            onClick={handleCheckoutClick}
            className="w-full shadow-md py-3 text-sm font-bold"
          >
            Collect Payment ({formatKES(totalAmount)})
          </Button>
        </div>
      </div>

      {/* Payment Processing Modal with Split Tender / M-Pesa / Cash */}
      <Dialog
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        title="Collect Payment"
        description="Select single method or record split payments (Cash, M-Pesa Till Code, STK Push)"
        maxWidth="lg"
      >
        <SplitPayment
          totalAmount={totalAmount}
          onComplete={handlePaymentSuccess}
          onCancel={() => setIsPaymentOpen(false)}
        />
      </Dialog>

      {/* Receipt Modal (Thermal ESC/POS Preview) */}
      <Dialog
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        title="Sale Receipt"
        maxWidth="sm"
      >
        {completedSale && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-gray-800 space-y-3">
              <div className="text-center border-b border-dashed border-gray-300 pb-2">
                <h4 className="font-bold text-sm uppercase">Vinnyx Technologies</h4>
                <p className="text-[10px] text-gray-500">Main Cyber & ICT Center</p>
                <p className="text-[10px] text-gray-500">Till: 5421980 | Tel: 0700 000 000</p>
              </div>

              <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                <div>Receipt: <strong className="font-bold">{completedSale.sale_number}</strong></div>
                <div>Date: {formatDate(completedSale.created_at)}</div>
                <div>Teller: {completedSale.teller_name}</div>
                <div>Customer: {completedSale.customer_name}</div>
              </div>

              <div className="space-y-1 border-b border-dashed border-gray-300 pb-2">
                {completedSale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-[11px]">
                    <span>{item.quantity}x {item.service_name}</span>
                    <span>{formatKES(item.total_price)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-0.5 text-[11px] border-b border-dashed border-gray-300 pb-2">
                <div className="flex justify-between font-bold">
                  <span>TOTAL:</span>
                  <span>{formatKES(completedSale.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Paid:</span>
                  <span>{formatKES(completedSale.amount_paid)}</span>
                </div>
                {completedSale.balance > 0 && (
                  <div className="flex justify-between text-amber-600 font-bold">
                    <span>Balance Due:</span>
                    <span>{formatKES(completedSale.balance)}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] space-y-0.5">
                <div className="font-semibold text-gray-600">Payment Breakdown:</div>
                {completedSale.payments.map((p, i) => (
                  <div key={i} className="flex justify-between text-gray-500">
                    <span className="capitalize">{p.method_code.replace('_', ' ')}:</span>
                    <span>{formatKES(p.amount)} {p.provider_reference ? `(${p.provider_reference})` : ''}</span>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2 text-[10px] text-gray-500">
                <p>Thank you for your business!</p>
                <p>Services rendered are non-refundable.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex-1"
              >
                <Printer className="h-4 w-4 mr-1.5" /> Print Thermal
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsReceiptOpen(false)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" /> New Sale
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Recent Sales History Drawer */}
      <Dialog
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="Recent Sales & Transactions"
        description="View recent service sales, reprint receipts, or void transactions"
        maxWidth="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentSales.length === 0 ? (
            <div className="text-xs text-gray-400 py-6 text-center">No sales recorded today yet.</div>
          ) : (
            recentSales.map((sale) => (
              <div
                key={sale.id}
                className="p-3.5 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{sale.sale_number}</span>
                    <Badge variant={sale.payment_status === 'voided' ? 'danger' : sale.payment_status === 'paid' ? 'success' : 'warning'}>
                      {sale.payment_status}
                    </Badge>
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    {formatDate(sale.created_at)} • Customer: {sale.customer_name} • Teller: {sale.teller_name}
                  </div>
                  <div className="text-gray-600 text-[11px] mt-1">
                    {sale.items.map((it) => `${it.quantity}x ${it.service_name}`).join(', ')}
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="text-sm font-bold text-gray-900 block">
                    {formatKES(sale.total)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCompletedSale(sale)
                        setIsReceiptOpen(true)
                      }}
                    >
                      <Receipt className="h-3 w-3" /> Receipt
                    </Button>
                    {sale.payment_status !== 'voided' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVoidSale(sale.id)}
                        className="text-rose-600 hover:bg-rose-50"
                        title="Void sale (reverse commission)"
                      >
                        <RotateCcw className="h-3 w-3" /> Void
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Dialog>
    </div>
  )
}
