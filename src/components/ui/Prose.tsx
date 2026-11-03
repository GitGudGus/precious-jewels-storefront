/**
 * Renders trusted Shopify rich text (`descriptionHtml`) with the Moonstone type
 * treatment. Replaces the ad-hoc `[&_a]:underline …` class soup that was inline
 * on the PDP and collection pages.
 */
export function Prose({
  html,
  className = '',
}: {
  html: string;
  className?: string;
}) {
  return (
    <div
      className={`text-sm leading-relaxed text-ink-muted [&_a:hover]:text-ink [&_a]:underline [&_b]:font-medium [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-ink [&_li]:my-1 [&_li]:ml-5 [&_li]:list-disc [&_p]:my-3 [&_strong]:font-medium [&_ul]:my-3 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
