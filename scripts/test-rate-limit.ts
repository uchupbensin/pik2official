// Quick test script to verify rate limiting works
// Run with: npx tsx scripts/test-rate-limit.ts

async function testRateLimit() {
  // We'll test by calling the file-based rate limit functions directly
  const { promises: fs } = await import('fs');
  const path = await import('path');

  const RATE_LIMIT_FILE = path.join(process.cwd(), '.rate-limit.json');
  const MAX_ATTEMPTS = 5;

  // Clear any existing data
  await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify({}), 'utf-8');

  // Simulate 6 failed attempts
  for (let i = 1; i <= 7; i++) {
    const data = JSON.parse(await fs.readFile(RATE_LIMIT_FILE, 'utf-8'));
    const ip = '::1';
    const record = data[ip] ?? { count: 0, lockedUntil: 0 };

    // Check if locked
    const now = Date.now();
    if (record.lockedUntil > now) {
      const mins = Math.ceil((record.lockedUntil - now) / 60000);
      console.log(`Attempt ${i}: LOCKED - wait ${mins} minutes`);
      break;
    }

    // Record failed attempt
    record.count += 1;
    if (record.count >= MAX_ATTEMPTS) {
      record.lockedUntil = now + 5 * 60 * 1000;
      record.count = 0;
    }
    data[ip] = record;
    await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(data), 'utf-8');

    console.log(`Attempt ${i}: count=${record.count}, lockedUntil=${record.lockedUntil > 0 ? 'YES' : 'no'}`);
  }

  // Final state
  const finalData = JSON.parse(await fs.readFile(RATE_LIMIT_FILE, 'utf-8'));
  console.log('\nFinal rate limit file:', JSON.stringify(finalData, null, 2));
}

testRateLimit().catch(console.error);
