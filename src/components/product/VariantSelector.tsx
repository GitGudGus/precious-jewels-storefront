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
    <div className="space-y-4">
      {options.map((option) => (
        <fieldset key={option.id}>
          <legend className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            {option.name}
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
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
                    'rounded-full border px-4 py-1.5 text-sm transition-colors',
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900'
                      : 'border-neutral-300 hover:border-neutral-500 dark:border-neutral-700 dark:hover:border-neutral-500',
                    !available &&
                      'cursor-not-allowed text-neutral-400 line-through hover:border-neutral-300 dark:text-neutral-600',
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
