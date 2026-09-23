/**
 * Spec bullet list — Color / Material / Neckline / etc., from Shopify's
 * `custom.*` metafields (see SPEC_METAFIELD_IDENTIFIERS in
 * lib/shopifyStorefront.ts). A metafield left blank in Shopify Admin is
 * simply absent from `product.specs` (mapStorefrontProduct filters out the
 * nulls), so this naturally renders fewer bullets rather than blank ones —
 * see Basic Cotton Kurti, which has none.
 */

import type { ProductSpec } from '@/@types/product';

export default function ProductSpecs({ specs }: { specs: ProductSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <ul className="mt-6 space-y-2 text-[15px] text-[#555]">
      {specs.map((spec) => (
        <li key={spec.key} className="flex gap-2">
          <span className="font-medium text-black">{spec.label}:</span>
          <span>{spec.value}</span>
        </li>
      ))}
    </ul>
  );
}
