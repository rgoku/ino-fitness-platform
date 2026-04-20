import { api, USE_API } from '@/lib/api';

// --- Types ---

export interface CheckoutSessionResponse {
  checkout_url: string;
  session_id: string;
}

export interface SubscriptionStatus {
  plan: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  current_period_end: string;
  cancel_at_period_end: boolean;
  max_clients: number;
}

export interface CancelResponse {
  success: boolean;
  cancel_at_period_end: boolean;
  current_period_end: string;
}

// --- Mock data (used when no API is configured) ---

const MOCK_SUBSCRIPTION: SubscriptionStatus = {
  plan: 'Pro Coach',
  status: 'active',
  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancel_at_period_end: false,
  max_clients: 100,
};

// --- Stripe helpers ---

/**
 * Create a Stripe Checkout Session and return the redirect URL.
 */
export async function createCheckoutSession(priceId: string): Promise<CheckoutSessionResponse> {
  if (USE_API) {
    return api.post<CheckoutSessionResponse>('/api/v1/subscriptions/checkout', {
      price_id: priceId,
    });
  }

  // Mock: simulate checkout creation
  await new Promise((r) => setTimeout(r, 500));
  return {
    checkout_url: `https://checkout.stripe.com/mock-session?price=${priceId}`,
    session_id: `cs_mock_${Date.now()}`,
  };
}

/**
 * Get the current user's subscription status.
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  if (USE_API) {
    return api.get<SubscriptionStatus>('/api/v1/subscriptions/status');
  }

  await new Promise((r) => setTimeout(r, 300));
  return { ...MOCK_SUBSCRIPTION };
}

/**
 * Cancel the current subscription (at period end).
 */
export async function cancelSubscription(): Promise<CancelResponse> {
  if (USE_API) {
    return api.post<CancelResponse>('/api/v1/subscriptions/cancel');
  }

  await new Promise((r) => setTimeout(r, 400));
  MOCK_SUBSCRIPTION.cancel_at_period_end = true;
  return {
    success: true,
    cancel_at_period_end: true,
    current_period_end: MOCK_SUBSCRIPTION.current_period_end,
  };
}
