/**
 * Specification table — Color / Material / Neckline / etc., from Shopify's
 * `custom.*` metafields (see SPEC_METAFIELD_IDENTIFIERS in
 * lib/shopifyStorefront.ts). A metafield left blank in Shopify Admin is
 * simply absent from `product.specs` (mapStorefrontProduct filters out the
 * nulls), so this naturally renders fewer rows rather than blank ones —
 * see Basic Cotton Kurti, which has none.
 */

import type { ProductSpec } from '@/@types/product';

export default function ProductSpecs({ specs, sku }: { specs: ProductSpec[]; sku?: string }) {
  const rows = [...specs.map((s) => ({ key: s.key, label: s.label, value: s.value })), ...(sku ? [{ key: 'sku', label: 'SKU', value: sku }] : [])];
  if (rows.length === 0) return null;

  return (
    <dl className="divide-y divide-[#EFE8DE] overflow-hidden rounded-md border border-[#E8DFD3] bg-white text-sm">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3">
          <dt className="text-[#6B6B6B]">{row.label}</dt>
          <dd className="font-medium text-dark">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
