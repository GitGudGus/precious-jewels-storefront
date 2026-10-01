'use client';

import { useActionState } from 'react';

import { subscribe, type NewsletterState } from './actions';

const INITIAL: NewsletterState = { status: 'idle', message: '' };

/** Email capture for the black newsletter band (expects an `on-ink` parent). */
export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, INITIAL);

  if (state.status === 'success') {
    return (
      <p role="status" className="mt-2 text-sm text-ink-invert">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="mt-2 w-full max-w-sm">
      <div className="flex border border-ink-invert/40">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="Email address"
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-ink-invert placeholder:text-ink-invert/60"
        />
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-ink-invert px-6 text-[11px] tracking-[0.15em] text-ink uppercase disabled:opacity-60"
        >
          {pending ? 'Joining…' : 'Sign up'}
        </button>
      </div>
      <p role="alert" className="mt-3 min-h-5 text-xs text-ink-invert/85">
        {state.status === 'error' ? state.message : ''}
      </p>
    </form>
  );
}
