import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { shopApi } from '@/api/shop'
import type { ShopProduct } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Dialog } from '@/components/ui/Dialog'
import { StkWaitingScreen } from '@/features/payments/StkWaitingScreen'
import { formatKES } from '@/lib/utils'
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Search,
  MessageCircle,
  ArrowLeft,
  Smartphone,
  MapPin,
} from 'lucide-react'

interface CartItem {
  product: ShopProduct
  quantity: number
}

export const ShopPage: React.FC = () => {
  const [products, setProducts] = useState<ShopProduct[]>([])
  const [category, setCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [isStkActive, setIsStkActive] = useState(false)
  const [completedOrderRef, setCompletedOrderRef] = useState<string | null>(null)

  useEffect(() => {
    shopApi.getProducts(category).then(setProducts)
  }, [category])

  const filtered = products.filter((p) => {
    const matchesCat = category === 'all' || p.category === category
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesSearch
  })

  const addToCart = (product: ShopProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta
            return nextQty > 0 ? { ...item, quantity: nextQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeItem = (productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const subtotal = cart.reduce((acc, it) => acc + it.product.price * it.quantity, 0)
  const totalItemsCount = cart.reduce((acc, it) => acc + it.quantity, 0)

  const handleStkSuccess = (_reference: string) => {
    setIsStkActive(false)
    setIsCheckoutOpen(false)
    const ref = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
    setCompletedOrderRef(ref)
    setCart([])
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900">
      {/* Top Shop Bar */}
      <div className="bg-blue-700 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-200" />
            <span>Store Location: Bomet CBD, Opposite Aga Khan Hospital</span>
          </div>
          <a
            href="https://wa.me/254750280280"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold hover:underline flex items-center gap-1 text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp: 0750280280
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                  VX
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-gray-900 leading-tight">Vinnyx Online Shop</h1>
                  <span className="text-[10px] text-blue-600 font-semibold block">Electronics, Stationery & Cyber Equipment</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/254750280280?text=Hello%20Vinnyx%20Shop,%20I%20have%20an%20inquiry%20regarding..."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200 hover:bg-green-100"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Order: 0750280280
              </a>

              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center shadow-xs">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              In-Store Counter & Instant Delivery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Genuine Laptops, Printers, Paper Reams & Supplies
            </h2>
            <p className="text-xs text-gray-600">
              Collect directly at our Bomet CBD shop (opposite Aga Khan Hospital) or receive dispatch to your office. Pay seamlessly with M-Pesa.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-blue-600 font-bold block">Need immediate assistance?</span>
            <span className="text-xl font-black text-gray-900 font-mono">0750 280 280</span>
          </div>
        </div>

        {/* Categories & Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'electronics', label: 'Laptops & Electronics' },
              { id: 'stationery', label: 'Paper & Stationery' },
              { id: 'printers', label: 'Printers' },
              { id: 'cyber_tools', label: 'Toners & Cyber Tools' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  category === cat.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Products Grid WITH REAL PRODUCT IMAGES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((prod) => (
            <Card key={prod.id} className="bg-white border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {prod.badge && (
                    <span className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {prod.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    {prod.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {prod.description}
                  </p>

                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-lg font-black text-blue-700">
                      {formatKES(prod.price)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">/ {prod.unit}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">
                    {prod.in_stock > 0 ? (
                      <span className="text-green-700 font-semibold">{prod.in_stock} in stock</span>
                    ) : (
                      <span className="text-rose-500">Out of stock</span>
                    )}
                  </span>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => addToCart(prod)}
                    disabled={prod.in_stock <= 0}
                    className="rounded-xl font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>&copy; 2026 Vinnyx Technologies. Bomet CBD, Opposite Aga Khan Hospital • Tel: 0750280280</span>
          <span>
            Designed by{' '}
            <a
              href="https://techrift-system.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold hover:underline"
            >
              Techrift Software
            </a>
          </span>
        </div>
      </footer>

      {/* Cart Drawer */}
      <Dialog
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        title="Your Shopping Basket"
        description={`${totalItemsCount} items selected`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400">
              Your cart is currently empty.
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 rounded-xl border border-gray-200 bg-white flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <h5 className="font-bold text-gray-900 leading-snug">
                        {item.product.name}
                      </h5>
                      <span className="text-gray-500 text-[11px]">
                        {formatKES(item.product.price)} each
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 font-bold text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <span className="font-black text-gray-900 min-w-16 text-right">
                      {formatKES(item.product.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.product.id)}
                      className="p-1 text-gray-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="pt-3 border-t border-gray-200 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-gray-600">Total Payable:</span>
                <span className="text-xl font-extrabold text-blue-700">
                  {formatKES(subtotal)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(false)}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsCartOpen(false)
                    setIsCheckoutOpen(true)
                  }}
                  className="flex-1 font-bold"
                >
                  Proceed to Checkout &rarr;
                </Button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false)
          setIsStkActive(false)
        }}
        title="Complete Your Order"
        description="M-Pesa Express STK prompt will be sent directly to your phone"
        maxWidth="md"
      >
        {isStkActive ? (
          <StkWaitingScreen
            phone={customerPhone}
            amount={subtotal}
            onSuccess={handleStkSuccess}
            onCancel={() => setIsStkActive(false)}
            onFallbackManual={() => handleStkSuccess('MANUAL-RECEIPT')}
          />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!customerPhone || customerPhone.length < 9) {
                alert('Please enter your M-Pesa phone number.')
                return
              }
              setIsStkActive(true)
            }}
            className="space-y-4 text-xs"
          >
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 flex justify-between items-center">
              <span className="text-blue-900 font-bold">Total Amount Due:</span>
              <span className="text-base font-black text-blue-800">{formatKES(subtotal)}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kiprono Cheruiyot"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  M-Pesa Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="0712 345 678"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                Fulfillment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Pick up at Bomet Shop (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`p-2.5 rounded-lg border font-bold text-center transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Local Delivery in Bomet
                </button>
              </div>
            </div>

            {deliveryType === 'delivery' && (
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Delivery Address / Office
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bomet CBD, Near Stadium"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCheckoutOpen(false)}
              >
                Back
              </Button>
              <Button type="submit" size="sm" className="font-bold">
                <Smartphone className="h-4 w-4 mr-1" /> Pay with M-Pesa STK Push
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      {/* Order Confirmed Modal */}
      <Dialog
        isOpen={!!completedOrderRef}
        onClose={() => setCompletedOrderRef(null)}
        title="Order Received!"
        maxWidth="sm"
      >
        <div className="text-center py-4 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h4 className="font-bold text-sm text-gray-900">
            Order Reference: <span className="font-mono text-blue-700">{completedOrderRef}</span>
          </h4>
          <p className="text-xs text-gray-600">
            Your items are being prepared at our shop opposite Aga Khan Hospital.
          </p>
          <a
            href={`https://wa.me/254750280280?text=Hello%20Vinnyx,%20I%20have%20completed%20order%20${completedOrderRef}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold"
          >
            <MessageCircle className="h-4 w-4" /> Message on WhatsApp (0750280280)
          </a>
        </div>
      </Dialog>
    </div>
  )
}
