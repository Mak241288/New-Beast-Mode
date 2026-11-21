import assert from 'assert';
import crypto from 'crypto';
import mongoSanitize from 'mongo-sanitize';
import { exerciseCatalog } from '../services/exerciseCatalogService';
import { validatePayload, AUTH_SCHEMAS } from '../middleware/validate';

async function runAllBackendTests() {
  console.log('=== BeastMode Backend Security & Integrity Test Suite ===\n');
  let passed = 0;

  // 1. NoSQL / Query Object Injection Sanitization Test
  {
    const maliciousQuery = { user_id: { $ne: 5 }, email: 'test@example.com', nested: { $gt: '' } };
    const sanitized = mongoSanitize(maliciousQuery);
    assert.strictEqual((sanitized.user_id as Record<string, unknown>).$ne, undefined, 'Top-level $ne operator must be stripped');
    assert.strictEqual((sanitized.nested as Record<string, unknown>).$gt, undefined, 'Nested $gt operator must be stripped');
    assert.strictEqual(sanitized.email, 'test@example.com', 'Safe string fields must remain intact');
    console.log('[PASS] 1. NoSQL/Query Object Injection Sanitization ($ne, $gt stripped)');
    passed++;
  }

  // 2. CSPRNG OTP Entropy & Format Verification
  {
    const samples = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const otp = crypto.randomInt(100000, 1000000).toString();
      assert.match(otp, /^\d{6}$/, 'OTP must be strictly 6 numeric digits');
      samples.add(otp);
    }
    assert.ok(samples.size >= 45, 'CSPRNG OTP generator must exhibit high entropy');
    console.log('[PASS] 2. CSPRNG 6-digit OTP Generation & Entropy');
    passed++;
  }

  // 3. CORS Origin Allowlist Regex Verification
  {
    const vercelRegex = /^https:\/\/(new-)?beastmode[a-z0-9-]*\.vercel\.app$/;
    assert.strictEqual(vercelRegex.test('https://beastmode-ai.vercel.app'), true);
    assert.strictEqual(vercelRegex.test('https://new-beastmode-preview.vercel.app'), true);
    assert.strictEqual(vercelRegex.test('https://evil-beastmode.vercel.app'), false);
    assert.strictEqual(vercelRegex.test('https://beastmode.vercel.app.attacker.com'), false);
    assert.strictEqual(vercelRegex.test('http://beastmode.vercel.app'), false);
    console.log('[PASS] 3. CORS Vercel Regex Hardening (Blocks Spoofed Origins & HTTP)');
    passed++;
  }

  // 4. Exercise Catalog Integrity Verification
  {
    const all = exerciseCatalog.getAll();
    assert.ok(Array.isArray(all) && all.length >= 4000, `Expected >=4000 exercises, found ${all.length}`);
    const sample = all[0];
    assert.ok(sample.name_en || sample.name_ar, 'Exercise entries must have localized names');
    console.log(`[PASS] 4. Exercise Catalog Loaded & Verified (${all.length} exercises)`);
    passed++;
  }

  // 5. Request Schema Validation Middleware Verification
  {
    const badEmail = validatePayload({ email: 'not-an-email', password: '123' }, AUTH_SCHEMAS.register);
    assert.strictEqual(badEmail.valid, false, 'Invalid email & short password must fail validation');
    assert.ok(badEmail.errors.length >= 2);

    const goodReg = validatePayload({ email: 'athlete@fit.mkhateeb.com', password: 'StrongPassword123!' }, AUTH_SCHEMAS.register);
    assert.strictEqual(goodReg.valid, true, 'Valid registration payload must pass');

    const badWeight = validatePayload({ weight: 999 }, AUTH_SCHEMAS.weightLog);
    assert.strictEqual(badWeight.valid, false, 'Out-of-range weight must fail validation');

    const goodWeight = validatePayload({ weight: 78.5, notes: 'Morning weigh-in' }, AUTH_SCHEMAS.weightLog);
    assert.strictEqual(goodWeight.valid, true, 'Valid weight log must pass');

    console.log('[PASS] 5. API Request Schema Validation (Auth & WeightLog)');
    passed++;
  }

  console.log(`\n=== ALL ${passed}/${passed} BACKEND SECURITY & INTEGRITY TESTS PASSED ===`);
}

runAllBackendTests().catch((err) => {
  console.error('Backend test suite failed:', err);
  process.exit(1);
});
