import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-neutral-600 dark:text-neutral-300">
        That page doesn’t exist or may have moved.
      </p>
      <Link
        href="/"
        className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
      >
        Back to home
      </Link>
    </div>
  );
}
