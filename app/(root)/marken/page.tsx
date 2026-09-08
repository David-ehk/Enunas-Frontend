'use client'

import { useEffect, useState } from 'react';
import { BrandListingsSection } from "./components/BrandListingsSection";
import { TopDesignerSection } from "./components/TopDesignerSection";
import { productApi } from '@/lib/api';
import { getTopDesigners } from '@/lib/topDesigners';

interface Brand {
  id: number;
  name: string;
  letter: string;
}

export default function MarkenPage() {
  const [allBrands, setAllBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [topDesignerNames, setTopDesignerNames] = useState<string[]>([]);

  // There is no public "list all brands" endpoint — /admin/brands exists but is ADMIN-only
  // (see CLAUDE.md's API contract). So, same as Sidebar.tsx's Marken count and
  // FeedPageContent's brand filter, the current brand list is derived from the public product
  // catalogue instead: every distinct brandName across live products.
  useEffect(() => {
    productApi.list({ size: 200 })
      .then(res => {
        const names = [...new Set(res.content.map(p => p.brandName).filter(Boolean))].sort()
        setAllBrands(names.map((name, i) => ({ id: i, name, letter: name.charAt(0).toUpperCase() })))
      })
      .catch(() => setAllBrands([]))
      .finally(() => setLoading(false))
  }, []);

  // Read client-side (not as a useState initializer) so SSR and the first client render both
  // start from an empty list and stay in sync — localStorage isn't available during SSR, and
  // this page is statically prerendered, so seeding state straight from it here would produce
  // a hydration mismatch the moment an admin has actually picked something.
  //
  // NOTE — interim, localStorage-only: this is the admin's own-browser preview picked in the
  // Schaufenster tab (dashboard/admin → Schaufenster → "Top Designer"), not a real backend
  // field. It reflects nothing for an actual site visitor unless that specific browser also
  // happens to be the admin's. See lib/topDesigners.ts.
  useEffect(() => {
    // localStorage hydration — deferred past first render to avoid an SSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTopDesignerNames(getTopDesigners())
  }, []);

  const topDesigners = topDesignerNames.map((name, i) => ({ id: i, name }))

  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: '96px' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl tracking-wide mb-2">
            Marken von A - Z
          </h2>
        </div>

        {topDesigners.length > 0 && <TopDesignerSection brands={topDesigners} />}
        {!loading && allBrands.length > 0 && <BrandListingsSection brands={allBrands} />}
      </div>
    </div>
  );
}
