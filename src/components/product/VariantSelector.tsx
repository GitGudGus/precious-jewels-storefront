'use client';

import type { ProductOption, ProductVariant } from '@/lib/shopify';

type Selection = Record<string, string>;

function variantMatches(
  variant: ProductVariant,
  selection: Selection,
): boolean {
  return variant.selectedOptions.every(
    (option) => selection[option.name] === option.value,
  );
}

/**
 * Controlled option picker. Renders one row of buttons per option; a value is
 * disabled when choosing it (with the other current selections) maps to no
 * purchasable variant.
 */
export function VariantSelector({
  options,
  variants,
  selection,
  onSelect,
}: {
  options: ProductOption[];
  variants: ProductVariant[];
  selection: Selection;
  onSelect: (optionName: string, value: string) => void;
}) {
  if (options.length === 0) return null;

  return (
    <div className="space-y-5">
      {options.map((option) => (
        <fieldset key={option.id}>
          <legend className="text-[11px] tracking-[0.16em] text-ink-muted uppercase">
            {option.name}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {option.values.map((value) => {
              const candidate = { ...selection, [option.name]: value };
              const available = variants.some(
                (variant) =>
                  variant.availableForSale &&
                  variantMatches(variant, candidate),
              );
              const isSelected = selection[option.name] === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSelect(option.name, value)}
                  aria-pressed={isSelected}
                  disabled={!available}
                  title={available ? undefined : `${value} — unavailable`}
                  className={[
                    'rounded-pill border px-5 py-2 text-sm transition-colors',
                    isSelected
                      ? 'border-ink bg-ink text-ink-invert'
                      : 'border-line hover:border-ink',
                    !available &&
                      'cursor-not-allowed text-ink-muted/50 line-through hover:border-line',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
