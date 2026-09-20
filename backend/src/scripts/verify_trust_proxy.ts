import proxyaddr from 'proxy-addr';
import express from 'express';

async function runTrustProxyVerification() {
  console.log('--- Starting CVE-2026-90711 Verification Suite ---');

  // 1. Version Check
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkgVersion = require('proxy-addr/package.json').version;
  console.log(`[1] Installed proxy-addr version: ${pkgVersion}`);
  if (pkgVersion !== '2.0.8' && !pkgVersion.startsWith('2.0.8')) {
    throw new Error(`Expected proxy-addr version 2.0.8+, found: ${pkgVersion}`);
  }

  // 2. CIDR Prefix Handling Verification
  // Test that standard IPv4 CIDR matches properly
  const trustIpv4 = proxyaddr.compile(['10.0.0.0/8', '192.168.1.0/24', '127.0.0.1']);
  if (!trustIpv4('10.1.2.3', 0) || !trustIpv4('192.168.1.50', 0) || !trustIpv4('127.0.0.1', 0)) {
    throw new Error('Standard IPv4 CIDR matching failed');
  }
  if (trustIpv4('8.8.8.8', 0) || trustIpv4('172.16.0.1', 0)) {
    throw new Error('False positive detected in IPv4 CIDR matching');
  }
  console.log('[2] Standard IPv4 CIDR trust verified: PASSED');

  // 3. IPv4-Mapped IPv6 Subnet Verification (CVE-2026-90711 fix verification)
  // Proper 104-bit prefix (96 bits for ::ffff: + 8 bits for 10.0.0.0/8)
  const trustMapped = proxyaddr.compile(['::ffff:10.0.0.0/104']);
  if (!trustMapped('::ffff:10.5.6.7', 0)) {
    throw new Error('Properly prefixed IPv4-mapped IPv6 (104-bit) failed to match');
  }
  if (trustMapped('::ffff:8.8.8.8', 0) || trustMapped('::1', 0)) {
    throw new Error('False positive in IPv4-mapped IPv6 CIDR');
  }
  console.log('[3] IPv4-mapped IPv6 (104-bit prefix) matching: PASSED');

  // 4. Express Trust Proxy Hop Count Validation
  const app = express();
  app.set('trust proxy', 1);

  // In Express, when trust proxy is 1, req.ip resolves to the immediate client before the last trusted proxy
  const reqMock: any = {
    connection: { remoteAddress: '127.0.0.1' },
    headers: {
      'x-forwarded-for': '203.0.113.195, 198.51.100.1',
    },
  };

  // Express compiles 'trust proxy' into 'trust proxy fn'
  const trustFn = app.get('trust proxy fn');
  const clientIp = proxyaddr(reqMock, trustFn);
  console.log(`[4] Express "trust proxy: 1" resolved client IP: ${clientIp}`);

  if (clientIp !== '198.51.100.1') {
    throw new Error(`Expected client IP 198.51.100.1 with trust proxy 1, got ${clientIp}`);
  }
  console.log('[4] Express "trust proxy: 1" hop resolution: PASSED');

  console.log('\nAll security and IP-resolution tests passed successfully (0 regressions)!');
}

runTrustProxyVerification().catch((err) => {
  console.error('\nVerification FAILED:', err);
  process.exit(1);
});
