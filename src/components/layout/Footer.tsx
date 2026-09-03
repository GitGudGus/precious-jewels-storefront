import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-neutral-400">
        <p>
          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
            Precious Jewels
          </span>{' '}
          — Miami. Gold-filled, 18k gold, and silver.
        </p>
        <nav className="flex gap-4">
          <Link
            href="/collections"
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            Shop all
          </Link>
          <Link
            href="/collections/new-arrivals"
            className="hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            New arrivals
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} Precious Jewels</p>
      </div>
    </footer>
  );
}
