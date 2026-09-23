'use client';

/**
 * Size/option picker for a product's variants.
 *
 * Shopify options are generic (any product can have Size, Color, Fabric...),
 * so this renders whatever `product.options` says rather than assuming
 * "Size" specifically. A single "Title"/"Default Title" option (Shopify's
 * placeholder for products with no real options — see the two Bridal items)
 * is filtered out upstream in productApi.ts, so this component only ever
 * sees options worth choosing between.
 */

import type { Product, ProductVariant } from '@/@types/product';

interface Props {
  product: Product;
  selectedVariant: ProductVariant | null;
  onSelect: (variant: ProductVariant) => void;
}

export default function VariantSelector({ product, selectedVariant, onSelect }: Props) {
  if (product.options.length === 0) return null;

  const selectOption = (optionName: string, value: string) => {
    const nextSelection: Record<string, string> = {};
    for (const opt of product.options) {
      const current = selectedVariant?.selectedOptions.find((o) => o.name === opt.name)?.value;
      nextSelection[opt.name] = opt.name === optionName ? value : (current ?? opt.values[0]);
    }

    const match = product.variants.find((v) =>
      v.selectedOptions.every((o) => nextSelection[o.name] === o.value),
    );

    if (match) onSelect(match);
  };

  return (
    <div className="mt-8 space-y-6">
      {product.options.map((option) => {
        const currentValue = selectedVariant?.selectedOptions.find(
          (o) => o.name === option.name,
        )?.value;

        return (
          <div key={option.name}>
            <p className="mb-3 text-sm uppercase tracking-[2px] text-gray-500">
              {option.name}
              {currentValue ? `: ${currentValue}` : ''}
            </p>

            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                /* Is there any variant at all with this value for this option?
                   Used to grey out combinations that don't exist rather than
                   letting the customer pick a dead end. */
                const variantExists = product.variants.some((v) =>
                  v.selectedOptions.some((o) => o.name === option.name && o.value === value),
                );

                const isSelected = currentValue === value;

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!variantExists}
                    onClick={() => selectOption(option.name, value)}
                    className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                      isSelected
                        ? 'border-black bg-black text-white'
                        : variantExists
                          ? 'border-[#D5D5D5] text-black hover:border-black'
                          : 'cursor-not-allowed border-[#EDEDED] text-[#CCC] line-through'
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedVariant && !selectedVariant.availableForSale && (
        <p className="text-sm text-secondary">This size is currently out of stock.</p>
      )}
    </div>
  );
}
