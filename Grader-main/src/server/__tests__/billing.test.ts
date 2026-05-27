import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import router from '../routes/billing';
import Stripe from 'stripe';

// Mock Stripe
vi.mock('stripe', () => {
  // Define a mock class that mimics the Stripe constructor
  const MockStripeClass = vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: vi.fn()
    }
    // Add other mocked methods of Stripe if needed for other tests
  }));
  // Return the mock constructor as the default export
  return { default: MockStripeClass };
});

// Helper function to create a mock request
function createMockRequest(body: any, signature?: string): Partial<Request> {
  return {
    headers: { 'stripe-signature': signature || 'valid-signature' },
    body,
    rawBody: Buffer.from(JSON.stringify(body))
  };
}

// Helper function to create a mock response
function createMockResponse() {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    send: vi.fn()
  };
  return res;
}

describe('POST /api/v1/billing/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for missing signature', async () => {
    const req = createMockRequest({}, undefined) as Request;
    const res = createMockResponse() as Response;

    await router.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Webhook signature missing'));
  });

  it('should return 400 for invalid signature', async () => {
    const req = createMockRequest({}, 'invalid-signature') as Request;
    const res = createMockResponse() as Response;

    vi.mocked(Stripe).mockImplementationOnce(() => ({
      webhooks: {
        constructEvent: vi.fn().mockImplementation(() => {
          throw new Error('Invalid signature');
        })
      }
    }));

    await router.handle(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Invalid signature'));
  });

  it('should process valid webhook events', async () => {
    const mockEvent = {
      type: 'invoice.paid',
      data: {
        object: {
          id: 'inv_123'
        }
      }
    };

    const req = createMockRequest(mockEvent, 'valid-signature') as Request;
    const res = createMockResponse() as Response;

    vi.mocked(Stripe).mockImplementationOnce(() => ({
      webhooks: {
        constructEvent: vi.fn().mockReturnValue(mockEvent)
      }
    }));

    await router.handle(req, res);

    expect(res.json).toHaveBeenCalledWith({ received: true });
  });
});
