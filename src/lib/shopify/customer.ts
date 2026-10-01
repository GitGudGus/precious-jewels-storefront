import { randomUUID } from 'node:crypto';

import { createCustomerMutation } from './queries/customer';
import { storefront } from './request';

type RawCustomerCreate = {
  customerCreate: {
    customer: { id: string } | null;
    customerUserErrors: { code: string | null; message: string }[];
  };
};

// The address is already a customer (TAKEN) or has a pending invite
// (CUSTOMER_DISABLED). Reported as success so the form can't be used to probe
// which emails have accounts.
const ALREADY_KNOWN = new Set(['TAKEN', 'CUSTOMER_DISABLED']);

/**
 * Add an email to the marketing list. The Storefront API has no
 * "subscribe" mutation, so this creates a customer with `acceptsMarketing`
 * and a throwaway password (the store uses passwordless accounts — nobody
 * ever logs in with it).
 *
 * ponytail: an existing customer who had opted out is NOT re-subscribed (that
 * needs the Admin API). Shopify also rate-limits customerCreate per calling
 * IP, and server actions all share Vercel's — if signups get throttled, pass
 * the visitor's address via the Shopify-Storefront-Buyer-IP header.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const data = await storefront<RawCustomerCreate>(createCustomerMutation, {
    input: { email, password: randomUUID(), acceptsMarketing: true },
  });

  const errors = data.customerCreate.customerUserErrors.filter(
    (e) => !ALREADY_KNOWN.has(e.code ?? ''),
  );
  if (errors.length > 0) {
    throw new Error(
      `Shopify customer error: ${errors.map((e) => e.message).join('; ')}`,
    );
  }
}
