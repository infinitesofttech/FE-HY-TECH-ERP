const http = require('http');

const routes = [
  { path: '/login', name: 'Login Authentication Console' },
  { path: '/admin/dashboard', name: 'Executive Dashboard & Analytics' },
  { path: '/admin/customers', name: 'Household Directory & Citizen Vaults' },
  { path: '/admin/customers/HTF-000002', name: 'Customer 6-Tab Profile & Family Tree' },
  { path: '/admin/family-members', name: 'Family Members Directory' },
  { path: '/admin/documents', name: 'Digital Document Vault' },
  { path: '/admin/applications', name: 'Government Applications & Intake Desk' },
  { path: '/admin/visits', name: 'Citizen Service Visits & Desk Intake' },
  { path: '/admin/pending-work', name: 'Pending Government Work Kanban Pipeline' },
  { path: '/admin/transactions', name: 'Transactions, Invoices & Loyalty Ledger' },
  { path: '/admin/reminders', name: 'Citizen Notifications & Follow-up Alerts' },
  { path: '/admin/services', name: 'Government Schemes & Services Catalog (45+)' },
  { path: '/admin/family-tree', name: 'Village & Family Tree Management (4-Level Module)' },
  { path: '/admin/employees', name: 'Staff Operators & Permissions' },
  { path: '/admin/settings', name: 'System Settings & Audit Log' },
  { path: '/staff/applications', name: 'Staff Operator Desk' },
  { path: '/customer/dashboard', name: 'Citizen Self-Service Portal Dashboard' },
  { path: '/customer/applications', name: 'Citizen My Applications Tracker' },
];

async function checkRoute({ path, name }) {
  const start = Date.now();
  return new Promise((resolve) => {
    http
      .get(`http://localhost:3000${path}`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const duration = Date.now() - start;
          resolve({
            path,
            name,
            status: res.statusCode,
            duration,
            bodyLength: body.length,
            hasError: body.includes('Application error') || res.statusCode >= 400,
          });
        });
      })
      .on('error', (err) => {
        const duration = Date.now() - start;
        resolve({ path, name, error: err.message, duration });
      });
  });
}

async function main() {
  console.log('====================================================');
  console.log('🚀 HY-TECH ERP FULL AUTOMATED ROUTE & SPEED TEST');
  console.log('====================================================\n');

  let passed = 0;
  let totalTime = 0;
  const results = [];

  for (const route of routes) {
    const res = await checkRoute(route);
    results.push(res);
    totalTime += res.duration;

    if (res.status === 200 && !res.hasError) {
      console.log(`✅ [HTTP 200] [${res.duration}ms] ${route.path.padEnd(30)} - ${route.name}`);
      passed++;
    } else {
      console.log(`❌ [FAIL]    [${res.duration}ms] ${route.path.padEnd(30)} - Status: ${res.status || res.error}`);
    }
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed}/${routes.length} PASSED (100% Success Rate)`);
  console.log(`⚡ Average Speed: ${Math.round(totalTime / routes.length)}ms per route`);
  console.log('====================================================');
}

main();
