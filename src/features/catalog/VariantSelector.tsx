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
 *
 * Values with a Shopify swatch (Color linked to the category metafield) show
 * as colour circles; the rest — sizes, or a colour without a swatch — stay
 * as text buttons.
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
    <div className="space-y-5">
      {product.options.map((option) => {
        const currentValue = selectedVariant?.selectedOptions.find(
          (o) => o.name === option.name,
        )?.value;

        return (
          <div key={option.name}>
            <p className="mb-2.5 text-[13px] text-[#6B6B6B]">
              {option.name}
              {currentValue && (
                <>
                  : <span className="font-semibold text-dark">{currentValue}</span>
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {option.values.map((value) => {
                /* Is there any variant at all with this value for this option?
                   Used to grey out combinations that don't exist rather than
                   letting the customer pick a dead end. */
                const variantExists = product.variants.some((v) =>
                  v.selectedOptions.some((o) => o.name === option.name && o.value === value),
                );

                const isSelected = currentValue === value;
                const swatch = option.swatches?.[value];

                if (swatch) {
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!variantExists}
                      onClick={() => selectOption(option.name, value)}
                      title={value}
                      aria-label={`${option.name}: ${value}${variantExists ? '' : ' (unavailable)'}`}
                      aria-pressed={isSelected}
                      className={`relative h-10 w-10 rounded-full p-0.5 transition ${
                        isSelected ? 'ring-2 ring-secondary ring-offset-2 ring-offset-[#FAF7F2]' : 'hover:ring-1 hover:ring-[#B5ABA0] hover:ring-offset-2 hover:ring-offset-[#FAF7F2]'
                      } ${variantExists ? '' : 'cursor-not-allowed opacity-40'}`}
                    >
                      <span
                        className="block h-full w-full rounded-full border border-black/10 bg-cover bg-center"
                        style={{
                          backgroundColor: swatch.color,
                          backgroundImage: swatch.image ? `url(${swatch.image})` : undefined,
                        }}
                      />
                      {!variantExists && (
                        <span className="absolute left-1/2 top-1/2 h-px w-11 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#666]" />
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!variantExists}
                    onClick={() => selectOption(option.name, value)}
                    aria-pressed={isSelected}
                    className={`inline-flex min-h-10 min-w-12 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors ${
                      isSelected
                        ? 'border-secondary bg-secondary text-white'
                        : variantExists
                          ? 'border-[#E4DED4] bg-white text-dark hover:border-secondary hover:text-secondary'
                          : 'cursor-not-allowed border-[#EDEDED] bg-white text-[#CCC] line-through'
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
        <p className="text-sm text-secondary">This option is currently out of stock.</p>
      )}
    </div>
  );
}
