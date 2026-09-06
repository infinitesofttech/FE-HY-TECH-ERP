const http = require('http');

const routes = [
  '/',
  '/admin/dashboard',
  '/admin/applications',
  '/admin/customers',
  '/admin/services',
  '/admin/documents',
  '/admin/visits',
  '/admin/pending-work',
  '/admin/reminders',
  '/admin/transactions',
  '/staff/applications',
  '/customer/dashboard',
  '/customer/applications',
];

async function checkRoute(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${path}`, (res) => {
      resolve({ path, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ path, error: err.message });
    });
  });
}

async function main() {
  console.log('Testing HY-TECH ERP routes...');
  let passCount = 0;
  for (const r of routes) {
    const res = await checkRoute(r);
    if (res.status === 200) {
      console.log(`[PASS] ${r} -> HTTP ${res.status}`);
      passCount++;
    } else {
      console.log(`[FAIL] ${r} -> ${res.status || res.error}`);
    }
  }
  console.log(`Finished: ${passCount}/${routes.length} routes passed.`);
}

main();
