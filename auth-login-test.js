const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname);

function createBrowserEnv() {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    url: 'http://localhost/',
    referrer: 'http://localhost/',
    contentType: 'text/html',
    storageQuota: 10000000,
    runScripts: 'dangerously',
    resources: 'usable'
  });
  return dom.window;
}

function loadScript(window, filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  window.eval(code);
}

(async () => {
  try {
    console.log('Starting admin auth test...');

    const loginWin = createBrowserEnv();
    loadScript(loginWin, path.join(root, 'js', 'db.js'));
    loadScript(loginWin, path.join(root, 'js', 'auth.js'));

    // Reset any stored admin account state.
    loginWin.localStorage.setItem('admins', JSON.stringify([{ username: 'admin', password: 'password123', name: 'Administrator' }]));
    loginWin.localStorage.removeItem('rvs_login_failures');
    loginWin.localStorage.removeItem('rvs_lockout_until');
    loginWin.sessionStorage.clear();

    const verify = await loginWin.Auth.verifyCredentials('admin', 'password123');
    console.log('verifyCredentials(admin, password123) =>', verify);
    if (!verify) {
      throw new Error('Default admin credentials verification failed.');
    }

    const session = await loginWin.Auth.login('admin', 'password123');
    console.log('login returned session:', session);
    const isLogged = loginWin.Auth.isLoggedIn();
    console.log('Auth.isLoggedIn() =>', isLogged);
    if (!isLogged) {
      throw new Error('Auth login succeeded but session is not active.');
    }

    const adminWin = createBrowserEnv();
    // Preserve state for admin page
    for (let i = 0; i < loginWin.localStorage.length; i++) {
      const key = loginWin.localStorage.key(i);
      adminWin.localStorage.setItem(key, loginWin.localStorage.getItem(key));
    }
    for (let i = 0; i < loginWin.sessionStorage.length; i++) {
      const key = loginWin.sessionStorage.key(i);
      adminWin.sessionStorage.setItem(key, loginWin.sessionStorage.getItem(key));
    }

    loadScript(adminWin, path.join(root, 'js', 'db.js'));
    loadScript(adminWin, path.join(root, 'js', 'auth.js'));

    // Simulate the admin route guard inline script
    const adminGuard = `
      if (!window.Auth || !window.Auth.isLoggedIn()) {
        window.location.href = 'login.html';
      }
    `;
    adminWin.eval(adminGuard);

    const redirected = adminWin.location.href.includes('login.html');
    console.log('Admin page redirected to login.html? =>', redirected);
    if (redirected) {
      throw new Error('Admin page was redirected to login.html despite valid session.');
    }

    console.log('Admin portal load check passed.');
    console.log('FINAL_RESULT: SUCCESS');
    process.exit(0);
  } catch (err) {
    console.error('FINAL_RESULT: FAILURE');
    console.error(err);
    process.exit(1);
  }
})();