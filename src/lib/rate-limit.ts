const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (record.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS - record.count };
}

export function getRateLimitStatus(ip: string): { count: number; resetTime: number } {
  const record = rateLimitMap.get(ip);
  if (!record) {
    return { count: 0, resetTime: Date.now() + WINDOW_MS };
  }
  return { count: record.count, resetTime: record.resetTime };
}
