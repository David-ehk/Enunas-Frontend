'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'
import { adminApi } from '@/lib/api'
import type { AdminBrand, ApiProduct, ApiOrder } from '@/types/api'

type Tab = 'brands' | 'products' | 'orders'

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-200 p-5 bg-white">
      <p className="text-xs uppercase tracking-[0.1em] text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

export default function AdminPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<Tab>('brands')
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [orders, setOrders] = useState<ApiOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user || user.role !== 'ADMIN') {
      router.replace('/account')
      return
    }
    Promise.all([
      adminApi.brands.getAll().catch(() => []),
      adminApi.products.getAll().catch(() => []),
      adminApi.orders.getAll().catch(() => []),
    ]).then(([b, p, o]) => {
      setBrands(b)
      setProducts(p)
      setOrders(o)
    }).finally(() => setLoading(false))
  }, [isLoading, user, router])

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    )
  }

  const pendingBrands = brands.filter(b => b.status === 'PENDING')
  const pendingProducts = products.filter(p => p.status === 'PENDING')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Brands gesamt" value={brands.length} />
        <StatCard label="Ausstehende Brands" value={pendingBrands.length} />
        <StatCard label="Ausstehende Produkte" value={pendingProducts.length} />
        <StatCard label="Bestellungen" value={orders.length} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {(['brands', 'products', 'orders'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm uppercase tracking-[0.1em] transition-colors duration-200 ${
              activeTab === tab
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab === 'brands' ? 'Marken' : tab === 'products' ? 'Produkte' : 'Bestellungen'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'brands' && (
        <div className="space-y-3">
          {brands.length === 0 ? (
            <p className="text-sm text-gray-500">Keine Marken vorhanden.</p>
          ) : (
            brands.map(brand => (
              <div key={brand.id} className="bg-white border border-gray-200 p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{brand.brandName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{brand.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase tracking-[0.05em] px-2 py-1 ${
                    brand.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                    brand.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                    brand.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {brand.status}
                  </span>
                  {brand.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => adminApi.brands.approve(brand.id).then(() => setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, status: 'APPROVED' as const } : b)))}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Genehmigen
                      </button>
                      <button
                        onClick={() => adminApi.brands.reject(brand.id).then(() => setBrands(prev => prev.map(b => b.id === brand.id ? { ...b, status: 'REJECTED' as const } : b)))}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Ablehnen
                      </button>
                    </>
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
                  <p className="text-xs text-gray-500 mt-0.5">{product.brandName} · SKU: {product.sku}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs uppercase tracking-[0.05em] px-2 py-1 ${
                    product.status === 'APPROVED' ? 'bg-green-50 text-green-700' :
                    product.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                    product.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {product.status}
                  </span>
                  {product.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => adminApi.products.approve(product.id).then(() => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'APPROVED' as const } : p)))}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Genehmigen
                      </button>
                      <button
                        onClick={() => adminApi.products.reject(product.id).then(() => setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'REJECTED' as const } : p)))}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Ablehnen
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
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
                <span className="text-xs uppercase tracking-[0.05em] px-2 py-1 bg-gray-100 text-gray-600">
                  {order.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
