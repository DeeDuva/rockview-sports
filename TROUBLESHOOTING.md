# Quick Troubleshooting Guide

Having problems with your Vercel deployment? Use this guide to solve common issues quickly.

---

## Common Problems & Solutions

### ❌ "Can't find repository" or 404 Error on Vercel

**Problem**: You see an error when trying to import your project to Vercel.

**Solutions**:
1. Make sure your GitHub repository is **Public** (not Private)
   - Go to GitHub → Your repository → Settings → Change visibility to Public
2. Make sure you used the correct GitHub URL
   - Copy from GitHub's green "Code" button
3. Sign out and sign back into Vercel

---

### ❌ "Build Failed" Error on Vercel

**Problem**: Vercel shows a red error message and won't deploy.

**Solutions**:
1. Click on the failed deployment to see error details
2. Check if all required files are uploaded:
   - `package.json` ✓
   - `index.html` ✓
   - `admin.html` ✓
   - `js/` folder ✓
   - `css/` folder ✓
3. Make sure `npm install` completed successfully

**If still stuck**:
- Delete the Vercel project and try again
- Verify your GitHub repository is public
- Wait 5 minutes and retry

---

### ❌ Site Shows "Cannot GET /" or Blank Page

**Problem**: You visit your site but see nothing or an error.

**Solutions**:
1. Wait a few more minutes (sometimes deployment takes longer)
2. Hard refresh your browser: `Ctrl + Shift + Delete` (clear cache)
3. Try accessing directly: `https://YOUR_SITE.vercel.app/index.html`
4. Check Vercel dashboard to see if deployment succeeded (green checkmark)

---

### ❌ Admin Login Doesn't Work

**Problem**: Login page appears but login fails or redirects incorrectly.

**Solutions**:
1. Check you're using the correct credentials:
   - Username: `admin`
   - Password: `Admin@123`
2. Clear browser cookies:
   - Press `Ctrl + Shift + Delete`
   - Select "Clear all"
   - Try logging in again
3. Try a different browser (Chrome, Firefox, Edge, Safari)
4. Make sure you're not in "Private/Incognito" mode

---

### ❌ Changes Don't Appear After I Pushed to GitHub

**Problem**: You made changes, pushed to GitHub, but the site hasn't updated.

**Solutions**:
1. **Wait 3-5 minutes** - Vercel needs time to rebuild and deploy
2. Check Vercel dashboard → Deployments to see if it's still building
3. If it's built, hard refresh: `Ctrl + Shift + F5`
4. Make sure you actually pushed the changes:
   - Open Command Prompt in your project folder
   - Run: `git status`
   - It should say "nothing to commit"

---

### ❌ Data Disappears After I Refresh or Log Out

**Problem**: Items I added are gone after closing the browser.

**Solutions**:
1. This is **normal** - The app uses browser `localStorage`
2. Each browser/device has separate storage
3. To share data across devices and users, you need a backend database
   - See `rockview-sports-backend/` folder for optional backend setup

---

### ❌ CSS/Styling Looks Broken

**Problem**: Colors, fonts, or layout look wrong on the live site.

**Solutions**:
1. Hard refresh: `Ctrl + Shift + F5`
2. Clear browser cache and cookies
3. Wait 10 minutes for cache to update on Vercel
4. Check the browser console for errors (F12 → Console tab)

---

### ❌ Images Don't Show Up

**Problem**: News images or hero image is missing/broken.

**Solutions**:
1. Check that image files are in the `assets/` folder:
   - `assets/news_default.png` ✓
   - `assets/hero_sports.jpg` ✓
2. Make sure image paths start with `/assets/`
3. Verify image files are actually uploaded to GitHub
4. Hard refresh: `Ctrl + Shift + F5`

---

### ❌ Site is Very Slow

**Problem**: Pages take a long time to load.

**Solutions**:
1. Check your internet connection
2. Clear browser cache: `Ctrl + Shift + Delete`
3. Try a different browser
4. Check Vercel status: https://www.vercel-status.com
5. Wait 10-15 minutes (sometimes Vercel is under high load)

---

### ❌ Can't Push Changes to GitHub

**Problem**: When you try to `git push`, you get an error.

**Solutions**:
1. Make sure you're in the correct project folder in Command Prompt
2. Check your internet connection
3. Run: `git status` to see if there are changes to commit
4. If you see changes, run:
   ```
   git add .
   git commit -m "Your message here"
   git push origin main
   ```
5. If it asks for password, use your GitHub Personal Access Token (not your password)

---

## How to Get Help

### 1. Check the Error Message
Most errors have a clear message. Write it down and search for it online.

### 2. Check Vercel Logs
- Go to Vercel dashboard
- Click on your project
- Go to "Deployments"
- Click on the failed deployment
- Scroll down to see build logs

### 3. Check GitHub Issues
- Search on GitHub if others had the same issue
- Look at the project's issues page

### 4. Ask for Help
- Vercel Support: https://vercel.com/support
- GitHub Support: https://github.com/support
- Stack Overflow: https://stackoverflow.com (search before asking)

---

## Still Stuck?

If nothing above works:

1. **Write down** the exact error message you see
2. **Take a screenshot** of the problem
3. **Check your email** - sometimes Vercel sends error notifications
4. **Contact support**:
   - Vercel: https://vercel.com/support/contact
   - GitHub: https://github.com/support/contact

---

## Prevention Tips

✅ **Always test locally** before pushing to GitHub  
✅ **Commit frequently** so you don't lose work  
✅ **Keep backups** of your code and data  
✅ **Document changes** in your commit messages  
✅ **Don't change sensitive files** unless you know what you're doing  

---

**Last Updated**: May 28, 2026
