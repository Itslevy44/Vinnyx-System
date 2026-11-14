import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { serviceRequestsApi } from '@/api/serviceRequests'
import { SHOP_PRODUCTS } from '@/api/shop'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { formatKES } from '@/lib/utils'
import {
  Printer,
  Wrench,
  ShoppingBag,
  Send,
  CheckCircle2,
  ArrowRight,
  Phone,
  MessageCircle,
  User,
  MapPin,
  Clock,
  Shield,
  FileCheck,
} from 'lucide-react'

export const LandingPage: React.FC = () => {
  // Service Request form state (immediate on page load, no login needed)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [category, setCategory] = useState<'printing' | 'cyber_gov' | 'design' | 'eulogy' | 'repair' | 'other'>('cyber_gov')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim() || !description.trim()) {
      alert('Please provide your name, phone number, and request description.')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await serviceRequestsApi.submitPublicRequest({
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_email: customerEmail.trim() || undefined,
        service_category: category,
        description: description.trim(),
        urgency,
      })
      setSubmittedRef(created.request_number)
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const featuredProducts = SHOP_PRODUCTS.slice(0, 4)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Notification / Location Bar */}
      <div className="bg-blue-700 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center font-medium">
            <MapPin className="h-3.5 w-3.5 text-blue-200" />
            <span>Located at Bomet CBD, Opposite Aga Khan Hospital</span>
          </div>
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-200" />
              <span>Mon - Fri: 8:00 AM - 7:00 PM | Sun: 9:00 AM - 7:00 PM | Sat: closed</span>
            </div>
            <a
              href="https://wa.me/254750280280?text=Hello%20Vinnyx%20Technologies,%20I%20need%20assistance%20with..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-white font-bold hover:underline"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp/Call: 0750280280</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-500/20">
                VX
              </div>
              <div>
                <span className="font-extrabold text-lg text-blue-900 block leading-tight tracking-tight">
                  Vinnyx Technologies
                </span>
                <span className="text-xs text-blue-600 font-semibold block">
                  Cyber Services • Stationeries • Computer & Phone Repairs
                </span>
              </div>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-7 text-xs font-bold text-gray-700">
              <a href="#request-section" className="text-blue-600 hover:text-blue-800 transition-colors">
                Request Service
              </a>
              <a href="#shop-section" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                <ShoppingBag className="h-3.5 w-3.5 text-blue-600" /> Shop Products
              </a>
              <a href="#repairs-section" className="hover:text-blue-600 transition-colors">
                Repairs Desk
              </a>
              <a href="#about-section" className="hover:text-blue-600 transition-colors">
                About & Location
              </a>
            </nav>

            {/* Actions: WhatsApp + Portal */}
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/254750280280?text=Hello%20Vinnyx%20Technologies,%20I%20need%20inquiry%20regarding..."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span className="hidden sm:inline">WhatsApp</span>
                <span className="font-mono">0750280280</span>
              </a>

              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO & IMMEDIATE SERVICE REQUEST SECTION (FIRST THING CUSTOMER SEES) */}
      <section id="request-section" className="bg-gradient-to-b from-blue-50 via-white to-white py-10 lg:py-14 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Welcome & Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                <span>Bomet CBD • Opposite Aga Khan Hospital</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                Cyber Services, IT Services, Printing & <span className="text-blue-600">Hardware Repairs</span> in Bomet
              </h1>

              <p className="text-sm text-gray-600 leading-relaxed">
                Welcome to Vinnyx Technologies. Get your government online applications, high-resolution color printing, thesis binding, and laptop diagnostics handled with professional speed.
              </p>

              {/* Service Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <FileCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800">KRA, ETIMS, HELB & eCitizen</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <Printer className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800">Design, typing, printing, photo framing/ mounting</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <Wrench className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800">Laptop, computer & Phone Repairs</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-gray-200 shadow-xs">
                  <Shield className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-800">Verified Service Guarantee</span>
                </div>
              </div>

              {/* Contact Callout */}
              <div className="flex items-center gap-4 pt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1.5 font-bold text-gray-900">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Call: 0750 280 280</span>
                </div>
                <span>•</span>
                <a
                  href="#shop-section"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Explore Electronics Shop &darr;
                </a>
              </div>
            </div>

            {/* Right Column: IMMEDIATE SERVICE REQUEST FORM */}
            <div className="lg:col-span-6">
              <Card className="border-2 border-blue-600 shadow-xl rounded-2xl bg-white overflow-hidden">
                <div className="bg-blue-600 text-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Submit a Service Request</h2>
                    <span className="text-[11px] bg-blue-500/80 text-white px-2.5 py-1 rounded-full font-bold">
                      No Login Needed
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 mt-1">
                    Fill in your request below. Our on-duty tellers in Bomet will review and get in touch immediately.
                  </p>
                </div>

                <div className="p-5 sm:p-6">
                  {submittedRef ? (
                    <div className="text-center py-6 space-y-3">
                      <div className="h-14 w-14 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        Request Received Successfully!
                      </h3>
                      <p className="text-xs text-gray-600 max-w-sm mx-auto">
                        Your tracking reference is{' '}
                        <strong className="text-blue-600 font-mono text-sm">{submittedRef}</strong>.
                        We are attending to it right now at our Bomet CBD counter.
                      </p>
                      <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                        <a
                          href={`https://wa.me/254750280280?text=Hello%20Vinnyx,%20I%20have%20submitted%20request%20${submittedRef}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="h-4 w-4" /> Message on WhatsApp
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSubmittedRef(null)}
                        >
                          Submit Another
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitRequest} className="space-y-3.5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Your Full Name *
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="e.g. Kiprono Cheruiyot"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                              type="tel"
                              placeholder="0712 345 678"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Select Service Category
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="cyber_gov">Government Portals (KRA, NTSA, HELB)</option>
                            <option value="printing">Printing & Photocopy (Color / B&W)</option>
                            <option value="design">Graphic Design, Posters & Cards</option>
                            <option value="eulogy">Eulogy Booklet Printing & Design</option>
                            <option value="repair">Computer / Laptop / Printer Repair</option>
                            <option value="other">Bulk Stationery / School Supplies</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            Urgency
                          </label>
                          <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as any)}
                            className="w-full py-2 px-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                          >
                            <option value="normal">Standard Service</option>
                            <option value="urgent">Express / Urgent (Within Today)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          Describe What You Need *
                        </label>
                        <textarea
                          rows={3}
                          placeholder="e.g. Need KRA tax compliance certificate, or print 200 copies of eulogy booklets on glossy paper..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        isLoading={isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md rounded-xl"
                      >
                        <Send className="h-4 w-4 mr-2" /> Submit Service Request to Tellers
                      </Button>
                    </form>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: SHOP PRODUCTS (ELECTRONICS, STATIONERY, PRINTERS) */}
      <section id="shop-section" className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Vinnyx Retail Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-1">
                Shop Electronics & Stationeries in Bomet
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                Browse our in-store inventory. Pick up at our shop opposite Aga Khan Hospital or order via WhatsApp.
              </p>
            </div>

            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors"
            >
              <ShoppingBag className="h-4 w-4" /> View Full Shop ({SHOP_PRODUCTS.length} Items)
            </Link>
          </div>

          {/* Product Cards with REAL IMAGES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
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
                      {prod.category}
                    </span>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-baseline justify-between border-t border-gray-100 pt-3">
                    <span className="text-base font-black text-blue-700">
                      {formatKES(prod.price)}
                    </span>
                    <Link
                      to="/shop"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      Buy Online &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs shadow-xs"
            >
              See all paper reams, toners, printers, SSDs & accessories
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 3: REPAIRS & HARDWARE LAB */}
      <section id="repairs-section" className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 h-80">
              <img
                src="https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80"
                alt="Electronics Hardware Repair"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="font-bold text-xs uppercase text-blue-200 block">Tellers 10 & 11 Station</span>
                  <h3 className="font-extrabold text-lg">Bomet Certified Electronics Lab</h3>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">
                Hardware & Device Troubleshooting
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Laptop Motherboard Diagnostics, Screen Replacements & Printer Service
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Our workshop is equipped for chip-level laptop repairs, broken screen replacements, thermal servicing, Epson ink waste pad resets, and motherboard power rail troubleshooting.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-gray-900">1. Intake Claim Slip</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">We record your device fault and issue an intake tracking slip.</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-gray-900">2. Transparent Diagnostics</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">We quote the exact required parts before work begins.</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-gray-900">3. SMS & WhatsApp Alerts</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">Receive notifications the moment your laptop passes final burn-in tests.</p>
                </div>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <h4 className="font-bold text-gray-900">4. Service Warranty</h4>
                  <p className="text-gray-500 text-[11px] mt-0.5">All hardware replacements come with warranty verification.</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#request-section"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                >
                  <Wrench className="h-4 w-4" /> Book in a Laptop or Phone
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: LOCATION & ABOUT */}
      <section id="about-section" className="py-14 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <Badge variant="neutral" className="bg-white text-blue-700 border-blue-200">
            Visit Our Main Center
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Conveniently Located in Bomet Town
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Situated in <strong>Bomet CBD, directly opposite Aga Khan Hospital</strong>. Walk in anytime during working hours for immediate counter service.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Opposite Aga Khan Hospital, Bomet CBD</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-800 shadow-xs">
              <Phone className="h-4 w-4 text-blue-600" />
              <span>Telephone: 0750 280 280</span>
            </div>
            <a
              href="https://wa.me/254750280280"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              <span>Chat on WhatsApp: 0750280280</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
            <div className="space-y-2">
              <span className="font-extrabold text-base text-white block">Vinnyx Technologies</span>
              <p className="text-gray-400 text-xs leading-relaxed">
                Bomet's trusted hub for cyber and IT operations, stationery reams, printing, and electronics repairs.
              </p>
              <span className="text-[11px] text-blue-400 block font-semibold">
                Bomet CBD, Opposite Aga Khan Hospital
              </span>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Core Services</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li>KRA Tax Returns & Compliance</li>
                <li>NTSA, HELB & eCitizen Portals</li>
                <li>Exam Booklet Printing & Binding</li>
                <li>Eulogy Program Graphic Design</li>
                <li>Laptop Chip-Level Repairs</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Retail Shop</h4>
              <ul className="space-y-1.5 text-gray-400 text-xs">
                <li>Laptops & Internal SSDs</li>
                <li>Epson EcoTank Printers</li>
                <li>Chamex A4 Paper Reams</li>
                <li>HP 85A Toner Cartridges</li>
                <li>USB Flash Drives & Cables</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Direct Support</h4>
              <p className="text-gray-400">Call or WhatsApp our desk:</p>
              <a
                href="https://wa.me/254750280280"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-green-600 text-white font-bold text-xs"
              >
                <MessageCircle className="h-4 w-4" /> 0750 280 280
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-[11px]">
            <span>&copy; 2026 Vinnyx Technologies. Bomet, Kenya. Opposite Aga Khan Hospital • Tel: 0750280280</span>
            <span>
              Designed by{' '}
              <a
                href="https://techrift-system.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-semibold hover:underline"
              >
                Techrift Software
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
