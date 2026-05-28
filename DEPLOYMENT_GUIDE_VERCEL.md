# Deploy Rockview Sports to Vercel - Step-by-Step Guide

## What You Need Before Starting
1. A **GitHub account** (it's free: https://github.com)
2. A **Vercel account** (it's free: https://vercel.com)
3. Your computer with the Rockview Sports project folder

---

## Step 1: Prepare Your Computer

### 1.1 Install Git
Git is a tool that tracks changes to your code. 

- **Windows**: Download from https://git-scm.com/download/win
- Follow the installer (click "Next" through all options)
- Restart your computer after installation

### 1.2 Open Command Prompt
- Press `Windows + R`
- Type `cmd` and press Enter
- This opens the command line where you'll type commands

---

## Step 2: Upload Your Project to GitHub

GitHub is a cloud storage for your code.

### 2.1 Create a Repository on GitHub
1. Go to https://github.com and sign in
2. Click the **+** icon (top right) → Select **New repository**
3. Name it: `rockview-sports` (or any name you prefer)
4. Select **Public** (so Vercel can access it)
5. Click **Create repository**
6. You'll see a page with setup instructions

### 2.2 Upload Your Project to GitHub
In the **Command Prompt** window:

```
cd C:\Users\danny\.gemini\antigravity\scratch\rockview-sports
```
(This navigates to your project folder)

Copy and paste these commands one by one, pressing Enter after each:

```
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Then:

```
git init
git add .
git commit -m "Initial commit - Rockview Sports app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rockview-sports.git
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username.**

⏳ **Wait 1-2 minutes.** The upload is in progress.

✅ When done, go to https://github.com/YOUR_USERNAME/rockview-sports and you should see your files!

---

## Step 3: Connect to Vercel and Deploy

Vercel is a hosting platform that automatically publishes your site to the internet.

### 3.1 Sign Up for Vercel
1. Go to https://vercel.com/signup
2. Click **Continue with GitHub**
3. Authorize Vercel to access your GitHub account
4. You're now logged into Vercel

### 3.2 Import Your Project
1. On the Vercel dashboard, click **Add New...** → **Project**
2. Select **Import Git Repository**
3. Paste your repository URL: `https://github.com/YOUR_USERNAME/rockview-sports`
4. Click **Continue**

### 3.3 Configure the Project
1. **Project Name**: `rockview-sports` (or keep the default)
2. **Root Directory**: Select `.` (current directory)
3. Click **Deploy**

⏳ **Wait 2-3 minutes.** Vercel is building and deploying your site.

✅ When you see "Congratulations! Your site is live," you're done!

---

## Step 4: Access Your Live Site

Your site is now live on the internet!

You'll get a URL like: `https://rockview-sports.vercel.app`

### Test Your Site:
- **Public Portal**: `https://rockview-sports.vercel.app/index.html`
- **Admin Portal**: `https://rockview-sports.vercel.app/admin.html`
- **Admin Login**: Use `admin` / `Admin@123`

---

## Step 5: Use Your Custom Domain (Optional)

If you want a custom domain (like `rockview-sports.com`):

1. Buy a domain from GoDaddy, Namecheap, or similar
2. In Vercel:
   - Go to **Settings** → **Domains**
   - Click **Add Domain**
   - Enter your domain name
   - Follow the instructions to point your domain to Vercel

---

## Important Precautions & Best Practices

### ⚠️ Security

1. **Never share your GitHub token** - Only you should have access
2. **Change default credentials** - After deployment:
   - Log in with `admin` / `Admin@123`
   - Change the password immediately
3. **Use HTTPS** - Vercel provides free SSL certificates (automatically enabled)

### 📱 Testing After Deployment

1. Test on **desktop and mobile** to ensure it works
2. Try logging in to the admin portal
3. Add a test match/news item to verify the database works
4. Test the public portal to ensure all data displays correctly

### 🔄 Updating Your Site

Whenever you make changes:

1. Make changes to your local project
2. Open Command Prompt in your project folder
3. Run:
   ```
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
4. Vercel automatically detects the changes and deploys them within 1-2 minutes

### 💾 Backup Your Data

- Your app data is stored in browser `localStorage`
- Each visitor's browser has its own data
- **Important**: If you need to preserve data, export it to a JSON file before making major changes

---

## Troubleshooting

### Site shows "404 Not Found"
- Wait 5 minutes for deployment to complete
- Refresh the page with `Ctrl + F5`
- Check that your GitHub repository is public

### Login doesn't work
- Clear browser cookies: `Ctrl + Shift + Delete`
- Use correct credentials: `admin` / `Admin@123`
- Try a different browser

### Data disappears after refresh
- This is normal in development mode
- Each browser stores data separately in `localStorage`
- To persist data across browsers, you need a backend database (see `rockview-sports-backend` folder)

### Changes don't appear after pushing to GitHub
- Wait 3-5 minutes for Vercel to rebuild
- Check the "Deployments" tab in Vercel to see build status
- If it shows an error, click on it for details

---

## Next Steps (Optional)

### 1. Set Up Analytics
- Vercel provides free analytics
- Go to **Settings** → **Analytics** in Vercel dashboard

### 2. Add a Backend Database
- The current app uses browser storage (localStorage)
- To share data across users, use the optional Express backend in `rockview-sports-backend/`
- Deploy it separately to a service like Render or Railway

### 3. Set Up Automatic Backups
- Add GitHub Actions to backup your data daily

---

## Quick Reference Cheatsheet

| Task | Command |
|------|---------|
| Upload changes to GitHub | `git add .` → `git commit -m "message"` → `git push origin main` |
| Check deployment status | Go to Vercel dashboard → Deployments |
| View live site | Click "Visit" button in Vercel dashboard |
| View build logs | Vercel dashboard → Deployments → Click deployment → Logs |

---

## Support Resources

- **Vercel Help**: https://vercel.com/support
- **GitHub Guide**: https://docs.github.com/en/get-started
- **Git Tutorial**: https://git-scm.com/doc

---

**Deployment Date**: May 28, 2026  
**Status**: Ready for Vercel deployment  
**Current Version**: 1.0.0
