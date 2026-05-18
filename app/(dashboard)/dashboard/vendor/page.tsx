'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { brandApi, productApi } from '@/lib/api'
import type { ApiBrandPartner, BrandOrder, ApiProduct } from '@/types/api'

type Tab = 'overview' | 'orders' | 'products'

export default function VendorPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [brandProfile, setBrandProfile] = useState<ApiBrandPartner | null>(null)
  const [orders, setOrders] = useState<BrandOrder[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'BRAND_PARTNER') {
      router.replace('/account')
      return
    }
    Promise.all([
      brandApi.getMe().catch(() => null),
      brandApi.getOrders().catch(() => []),
      productApi.getMy().catch(() => []),
    ]).then(([bp, o, p]) => {
      setBrandProfile(bp)
      setOrders(o)
      setProducts(p)
    }).finally(() => setLoading(false))
  }, [isLoading, user, router])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const STATUS_COLOR: Record<string, string> = {
    APPROVED: 'bg-green-50 text-green-700',
    PENDING: 'bg-yellow-50 text-yellow-700',
    VERIFIED: 'bg-blue-50 text-blue-700',
    REJECTED: 'bg-red-50 text-red-700',
    SUSPENDED: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {brandProfile?.brandName ?? 'Vendor Dashboard'}
          </h1>
          {brandProfile && (
            <span className={`inline-block mt-1 text-xs uppercase tracking-[0.05em] px-2 py-1 ${STATUS_COLOR[brandProfile.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {brandProfile.status}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['overview', 'orders', 'products'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm uppercase tracking-[0.1em] transition-colors duration-200 ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab === 'overview' ? 'Übersicht' : tab === 'orders' ? 'Bestellungen' : 'Produkte'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && brandProfile && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500 mb-1">Produkte</p>
            <p className="text-2xl font-semibold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500 mb-1">Bestellungen</p>
            <p className="text-2xl font-semibold text-gray-900">{orders.length}</p>
          </div>
          <div className="bg-white border border-gray-200 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-gray-500 mb-1">Status</p>
            <p className="text-sm font-semibold text-gray-900">{brandProfile.status}</p>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Bestellungen vorhanden.</p>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('de-DE')} · €{order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.05em] px-2 py-1 bg-gray-100 text-gray-600">
                    {order.status}
                  </span>
                  {order.status === 'PAID' && (
                    <button
                      onClick={() => {
                        const tracking = prompt('Sendungsnummer eingeben:')
                        if (tracking) brandApi.shipOrder(order.id, tracking).then(() => setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'SHIPPED' as const } : o)))
                      }}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Versenden
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-3">
          {products.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Produkte vorhanden.</p>
          ) : (
            products.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">SKU: {product.sku} · {product.category}</p>
                </div>
                <span className={`text-xs uppercase tracking-[0.05em] px-2 py-1 ${STATUS_COLOR[product.status] ?? 'bg-gray-100 text-gray-600'}`}>
                  {product.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
