# Rockview Sports - Local Development

## Overview
The application now runs **purely on the client side** using `localStorage` for data persistence. No backend server or SQLite database is required.

## Quick Start
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start the static server**:
   ```bash
   npm start
   ```
   This serves the files from the project root on `http://localhost:3000/`.
3. **Open the public portal**:
   - URL: `http://localhost:3000/index.html`
   - You can browse matches, results, and news. All data is stored in your browser's `localStorage`.
3. **Open the admin portal** (protected):
   - URL: `http://localhost:3000/admin.html`
   - **Default credentials**: `admin` / `Admin@123`
   - After logging in you can manage matches, results, and news.

## Diagnostic Checks
A small script `diagnostic.js` is provided to verify that:
- The required `localStorage` keys (`admins`, `matches`, `results`, `news`) exist.
- The admin login works and redirects appropriately.

### Run the diagnostic (in a browser console)
1. Open the **public portal** (`index.html`).
2. Open the developer console (F12).
3. Paste the following code and press **Enter**:
```javascript
fetch('diagnostic.js')
  .then(r => r.text())
  .then(eval)
  .catch(e => console.error('Diagnostic error:', e));
```
The script will log the verification results to the console.

## Deployment
This project is a static web application that runs entirely in the browser using `localStorage` for persistence.

### Recommended deployment options
- Upload the project root to any static host (GitHub Pages, Netlify, Vercel, Surge, etc.).
- Use `npm start` locally to verify the site before deployment.

### Production preview
```bash
npm install
npm start
```
Then open `http://localhost:3000/` in your browser.

### Optional backend
The `rockview-sports-backend/` folder contains a legacy Express/SQLite API server for a server-backed version of the app. The current public/admin pages are configured to use browser `localStorage`, so the backend is optional.

---
*Generated on 2026-05-28.*
