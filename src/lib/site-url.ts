export function getSiteUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // In local development without NEXT_PUBLIC_SITE_URL, fallback to localhost
  if (process.env.NODE_ENV === 'development' && !rawUrl) {
    return 'http://localhost:3000';
  }

  // Force canonical domain https://pik2official.id if missing or mistakenly set to .com or localhost in production
  if (!rawUrl || rawUrl.includes('localhost') || rawUrl.includes('pik2official.com')) {
    return 'https://pik2official.id';
  }

  return rawUrl.replace(/\/$/, '');
}
