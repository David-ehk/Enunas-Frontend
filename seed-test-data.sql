-- =============================================================================
-- Local dev seed — test brand, product, listing, and UPSELL10 discount code
--
-- Run once against your local Enunas DB:
--   psql -U postgres -d Enunas -f seed-test-data.sql
--
-- Requires pgcrypto (pre-installed on most Postgres distros).
-- Idempotent — safe to re-run; existing rows are left untouched.
--
-- After running: update UPSELL_CONFIG.listingId in
--   app/(root)/orders/[orderNumber]/confirmation/ConfirmationClient.tsx
-- with the "Listing ID" printed in the NOTICE output.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id    bigint;
  v_brand_id   bigint;
  v_product_id bigint;
  v_color_id   bigint;
  v_variant_id bigint;
  v_listing_id bigint;
BEGIN

  -- ── 1. Brand partner user ─────────────────────────────────────────────────
  SELECT id INTO v_user_id FROM users WHERE email = 'testbrand@enunas.dev';
  IF v_user_id IS NULL THEN
    INSERT INTO users (email, password, role, enabled, admin_approved, created_at)
    VALUES (
      'testbrand@enunas.dev',
      crypt('TestBrand2025!', gen_salt('bf', 10)),
      'BRAND_PARTNER',
      true,
      true,
      NOW()
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- ── 2. Brand partner record ───────────────────────────────────────────────
  SELECT id INTO v_brand_id FROM brand_partners WHERE user_id = v_user_id;
  IF v_brand_id IS NULL THEN
    INSERT INTO brand_partners (
      user_id, brand_name, slug, status, approved, domestic, created_at, updated_at
    )
    VALUES (
      v_user_id,
      'Enunas Test Brand',
      'enunas-test-brand',
      'ACTIVE',
      true,
      true,   -- domestic=true → German VAT on commission applies
      NOW(),
      NOW()
    )
    RETURNING id INTO v_brand_id;
  END IF;

  -- ── 3. Brand economics (required by LedgerService) ────────────────────────
  INSERT INTO brand_economics (
    brand_id, default_commission_rate, pending_balance, payout_balance,
    lifetime_revenue, paid_out_total, outstanding_debt, version
  )
  VALUES (v_brand_id, 0.18, 0, 0, 0, 0, 0, 0)
  ON CONFLICT (brand_id) DO NOTHING;

  -- ── 4. Brand analytics ────────────────────────────────────────────────────
  INSERT INTO brand_analytics (brand_id, revenue, conversion_rate, total_sales, total_views)
  VALUES (v_brand_id, 0, 0, 0, 0)
  ON CONFLICT (brand_id) DO NOTHING;

  -- ── 5. Product ────────────────────────────────────────────────────────────
  -- category must be one of: CLOTHING, SHOES, ACCESSORIES, PERFUME
  -- outfit_slot: TOP, BOTTOM, OUTERWEAR, FOOTWEAR, ACCESSORY
  -- product_type: JACKET (and others listed in the check constraint)
  -- gender: UNISEX, MEN, WOMEN, OTHER
  -- status: ACTIVE, SUSPENDED, REJECTED, INACTIVE, ARCHIVED
  SELECT id INTO v_product_id
  FROM products
  WHERE brand_id = v_brand_id AND name = 'Denim Boxer Jacket';

  IF v_product_id IS NULL THEN
    INSERT INTO products (
      brand_id, creator_id, name, description,
      category, gender, outfit_slot, product_type, status,
      complete_the_look_enabled, return_period_days,
      material, origin_country, created_at, updated_at
    )
    VALUES (
      v_brand_id, v_user_id,
      'Denim Boxer Jacket',
      'Test product for upsell discount demo. Platform-absorbed 10% off via UPSELL10.',
      'CLOTHING', 'UNISEX', 'OUTERWEAR', 'JACKET', 'ACTIVE',
      false, 14,
      '100% Denim', 'IT',
      NOW(), NOW()
    )
    RETURNING id INTO v_product_id;
  END IF;

  -- ── 6. Product color (sku max 8 chars per schema constraint) ─────────────
  SELECT id INTO v_color_id
  FROM product_colors
  WHERE product_id = v_product_id AND color = 'BLACK';

  IF v_color_id IS NULL THEN
    INSERT INTO product_colors (product_id, color, sku)
    VALUES (v_product_id, 'BLACK', 'TJ-BK-01')
    RETURNING id INTO v_color_id;
  END IF;

  -- ── 7. Product variant (size M) ───────────────────────────────────────────
  SELECT id INTO v_variant_id
  FROM product_variants
  WHERE product_id = v_product_id AND product_color_id = v_color_id AND size = 'M';

  IF v_variant_id IS NULL THEN
    INSERT INTO product_variants (product_id, product_color_id, size, stock_quantity)
    VALUES (v_product_id, v_color_id, 'M', 100)
    RETURNING id INTO v_variant_id;
  END IF;

  -- ── 8. Listing (€119 gross) ───────────────────────────────────────────────
  -- After running: note the Listing ID below and update UPSELL_CONFIG.listingId
  -- in app/(root)/orders/[orderNumber]/confirmation/ConfirmationClient.tsx
  SELECT id INTO v_listing_id
  FROM listings
  WHERE product_id = v_product_id AND variant_id = v_variant_id;

  IF v_listing_id IS NULL THEN
    INSERT INTO listings (
      product_id, variant_id, price, currency, active, region, created_at, updated_at
    )
    VALUES (
      v_product_id, v_variant_id,
      119.00, 'EUR', true, 'DE',
      NOW(), NOW()
    )
    RETURNING id INTO v_listing_id;
  END IF;

  -- ── 9. UPSELL10 discount code ─────────────────────────────────────────────
  -- type=ADMIN → platform absorbs 100% of discount, brand payout unchanged
  -- percent=0.1000 → 10% (server-side cap for ADMIN type is 10%)
  -- max_uses=NULL → unlimited
  INSERT INTO discount_codes (
    code, type, percent, used_count, active, created_at, updated_at
  )
  VALUES ('UPSELL10', 'ADMIN', 0.1000, 0, true, NOW(), NOW())
  ON CONFLICT (code) DO UPDATE
    SET active = true, percent = 0.1000, updated_at = NOW();

  -- ── Summary ───────────────────────────────────────────────────────────────
  RAISE NOTICE '';
  RAISE NOTICE '=== SEED COMPLETE ===';
  RAISE NOTICE 'Brand User ID  : %  (login: testbrand@enunas.dev / TestBrand2025!)', v_user_id;
  RAISE NOTICE 'Brand ID       : %', v_brand_id;
  RAISE NOTICE 'Product ID     : %', v_product_id;
  RAISE NOTICE 'Variant ID     : %  (size M / BLACK)', v_variant_id;
  RAISE NOTICE 'Listing ID     : %  ← copy this into UPSELL_CONFIG.listingId', v_listing_id;
  RAISE NOTICE 'Listing price  : €119.00 (→ upsell shows €107.10 after −10%%)';
  RAISE NOTICE 'UPSELL10 code  : ADMIN type, 10%%, unlimited uses, active';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update UPSELL_CONFIG.listingId = % in ConfirmationClient.tsx', v_listing_id;
  RAISE NOTICE '  2. Start backend: SPRING_PROFILES_ACTIVE=mock-payments ./mvnw spring-boot:run';
  RAISE NOTICE '  3. Register + login as a CUSTOMER in the frontend';
  RAISE NOTICE '  4. Complete a mock checkout → confirm page shows upsell 20%% of the time';
  RAISE NOTICE '  5. Accept upsell → verifies UPSELL10 applies, brandPayout unchanged';

END $$;
