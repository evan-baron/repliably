import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { checkRateLimit, getClientIp, RATE_LIMITS } from './rate-limiter';

describe('checkRateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should allow requests within limit', () => {
    // Use unique identifiers for each test to avoid interference
    const testId = `test-${Date.now()}-allow`;

    const result = checkRateLimit(testId, 'api');

    expect(result.allowed).toBe(true);
    expect(result.headers['X-RateLimit-Limit']).toBe(String(RATE_LIMITS.api.maxRequests));
  });

  it('should return rate limit headers', () => {
    const testId = `test-${Date.now()}-headers`;

    const result = checkRateLimit(testId, 'webhook');

    expect(result.headers).toHaveProperty('X-RateLimit-Limit');
    expect(result.headers).toHaveProperty('X-RateLimit-Remaining');
    expect(result.headers).toHaveProperty('X-RateLimit-Reset');
  });

  it('should have correct limits for different rate limit types', () => {
    expect(RATE_LIMITS.webhook.maxRequests).toBe(100);
    expect(RATE_LIMITS.api.maxRequests).toBe(60);
    expect(RATE_LIMITS.sendEmail.maxRequests).toBe(100);
  });

  it('should have correct windows for different rate limit types', () => {
    expect(RATE_LIMITS.webhook.windowMs).toBe(60 * 1000); // 1 minute
    expect(RATE_LIMITS.api.windowMs).toBe(60 * 1000); // 1 minute
    expect(RATE_LIMITS.sendEmail.windowMs).toBe(60 * 60 * 1000); // 1 hour
  });
});

describe('getClientIp', () => {
  it('should extract IP from x-forwarded-for header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      },
    });

    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should extract IP from x-real-ip header', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-real-ip': '192.168.1.2',
      },
    });

    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.2');
  });

  it('should prefer x-forwarded-for over x-real-ip', () => {
    const request = new Request('https://example.com', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
      },
    });

    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const request = new Request('https://example.com');

    const ip = getClientIp(request);
    expect(ip).toBe('unknown');
  });
});
