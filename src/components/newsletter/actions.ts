'use server';

import { subscribeToNewsletter } from '@/lib/shopify';

export type NewsletterState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const success: NewsletterState = {
    status: 'success',
    message: "You're on the list. We'll be in touch before the drop.",
  };

  // Honeypot: a hidden field real visitors never fill. Bots get a fake success.
  if (formData.get('company')) return success;

  const email = String(formData.get('email') ?? '').trim();
  if (email.length > 254 || !EMAIL.test(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  try {
    await subscribeToNewsletter(email);
    return success;
  } catch (error) {
    console.error('Newsletter signup failed', error);
    return {
      status: 'error',
      message: 'Something went wrong. Please try again in a moment.',
    };
  }
}
