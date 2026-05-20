'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'

import BrandOverviewPage from './brand-partner/OverviewPage'
import BrandProductsPage from './brand-partner/ProductsPage'
import BrandOrdersPage from './brand-partner/OrdersPage'
import BrandPayoutsPage from './brand-partner/PayoutsPage'

import AdminOverviewPage from './admin/OverviewPage'
import AdminBrandPartnersPage from './admin/BrandPartnersPage'
import AdminOrdersPage from './admin/OrdersPage'
import AdminApplicationsPage from './admin/ApplicationsPage'
import AdminPayoutsPage from './admin/PayoutsPage'

type Role = 'brand-partner' | 'admin'

const BRAND_PAGES: Record<string, React.ComponentType> = {
  overview:  BrandOverviewPage,
  products:  BrandProductsPage,
  orders:    BrandOrdersPage,
  payouts:   BrandPayoutsPage,
  analytics: BrandOverviewPage,
  settings:  BrandOverviewPage,
}

const ADMIN_PAGES: Record<string, React.ComponentType> = {
  overview:     AdminOverviewPage,
  brands:       AdminBrandPartnersPage,
  products:     AdminBrandPartnersPage,
  orders:       AdminOrdersPage,
  payouts:      AdminPayoutsPage,
  applications: AdminApplicationsPage,
  settings:     AdminOverviewPage,
}

export default function DashboardPage() {
  const [role, setRole] = useState<Role>('brand-partner')
  const [activePage, setActivePage] = useState('overview')

  const pages = role === 'brand-partner' ? BRAND_PAGES : ADMIN_PAGES
  const PageComponent = pages[activePage] ?? (role === 'brand-partner' ? BrandOverviewPage : AdminOverviewPage)

  const handleToggleRole = () => {
    setRole(r => (r === 'brand-partner' ? 'admin' : 'brand-partner'))
    setActivePage('overview')
  }

  const handleNavigate = (page: string) => {
    setActivePage(page)
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F5F5F0' }}>
      <Sidebar role={role} activePage={activePage} onNavigate={handleNavigate} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar role={role} activePage={activePage} onToggleRole={handleToggleRole} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <PageComponent />
        </main>
      </div>
    </div>
  )
}
