import fs from 'node:fs';

const ui = fs.readFileSync('tester/buypoint/index.html', 'utf8');
const provider = fs.readFileSync('services/buypoint-provider/src/index.js', 'utf8');
const architecture = fs.readFileSync('docs/buypoint/SERVICE_OWNED_PROVIDER_ARCHITECTURE.md', 'utf8');

const failures = [];

const forbiddenUiPatterns = [
  /OPENAI_API_KEY/i,
  /BUYPOINT_OPENAI_API_KEY/i,
  /enter\s+(?:your\s+)?api\s*key/i,
  /paste\s+(?:your\s+)?api\s*key/i,
  /provider\s+api\s*key/i,
  /type=["']password["'][^>]*(?:api|key)/i,
];

for (const pattern of forbiddenUiPatterns) {
  if (pattern.test(ui)) failures.push(`Customer UI contains forbidden credential pattern: ${pattern}`);
}

if (!/env\.BUYPOINT_OPENAI_API_KEY/.test(provider)) {
  failures.push('Provider is not reading its credential from server-side environment configuration.');
}
if (/localStorage[^\n]*(?:API_KEY|OPENAI|Bearer)/i.test(provider + '\n' + ui)) {
  failures.push('Credential-like data appears to be stored in browser localStorage.');
}
if (!/customer.*never.*API key|never be asked.*API key/i.test(architecture)) {
  failures.push('Architecture does not state the no-customer-API-key product contract.');
}
if (!/service-owned/i.test(architecture)) {
  failures.push('Architecture does not define service-owned credential ownership.');
}

if (failures.length) {
  console.error('BUYPOINT NO-CUSTOMER-KEY GATE: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('BUYPOINT NO-CUSTOMER-KEY GATE: PASS');
console.log('Customer bundle contains no API-key setup requirement; provider credential remains server-side.');