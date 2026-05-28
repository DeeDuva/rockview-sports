// diagnostic.js – simple verification script for Rockview Sports
// This script runs in Node and opens the public and admin URLs in the default browser.
// It does not perform headless checks; the user can visually confirm the pages.
const { exec } = require('child_process');

function openUrl(url) {
  // Windows command to open URL in default browser
  exec(`start "" "${url}"`, (err) => {
    if (err) console.error('Failed to open URL:', url, err);
  });
}

const publicUrl = 'http://localhost:3000/';
const adminUrl = 'http://localhost:3000/admin.html';

console.log('--- Diagnostic Check Started ---');
console.log('Opening public portal...');
openUrl(publicUrl);

setTimeout(() => {
  console.log('Opening admin portal (requires login)...');
  openUrl(adminUrl);
}, 3000);

setTimeout(() => {
  console.log('--- Diagnostic Check Completed ---');
  console.log('Please verify:');
  console.log('- Public site loads and displays data from localStorage');
  console.log('- Admin login works with username: admin and password: Admin@123');
  console.log('- Accessing admin.html without login redirects to login screen');
}, 6000);
