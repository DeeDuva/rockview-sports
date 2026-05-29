# Rockview Sports - Vercel Deployment Checklist

Use this checklist to track your deployment progress. Check off each item as you complete it.

---

## Pre-Deployment Checklist

- [ ] I have a GitHub account (https://github.com)
- [ ] I have a Vercel account (https://vercel.com)
- [ ] Git is installed on my computer (https://git-scm.com)
- [ ] I have the Rockview Sports project folder on my computer
- [ ] I've tested the app locally and it works

---

## GitHub Upload Checklist

- [ ] I've created a new repository on GitHub called `rockview-sports`
- [ ] I've opened Command Prompt and navigated to my project folder
- [ ] I've run `git init`
- [ ] I've run `git add .`
- [ ] I've run `git commit -m "Initial commit - Rockview Sports app"`
- [ ] I've run `git push -u origin main` (after setting up the remote)
- [ ] I can see my files on GitHub (https://github.com/YOUR_USERNAME/rockview-sports)

---

## Vercel Deployment Checklist

- [ ] I've signed up for Vercel (https://vercel.com)
- [ ] I've authorized Vercel to access my GitHub account
- [ ] I've clicked **Add New** → **Project** on Vercel dashboard
- [ ] I've selected **Import Git Repository**
- [ ] I've pasted my repository URL
- [ ] I've clicked **Deploy** and waited 2-3 minutes
- [ ] I see "Congratulations! Your site is live" message
- [ ] I have my live URL (looks like: `https://rockview-sports.vercel.app`)

---

## Post-Deployment Testing Checklist

### Public Portal
- [ ] I can open the public site: `https://YOUR_SITE.vercel.app/index.html`
- [ ] The home page loads correctly
- [ ] I can see the "Announcements" section
- [ ] I can see the "Upcoming Matches" section
- [ ] I can see the "Latest Results" section
- [ ] The "Admin Login" button works

### Admin Portal
- [ ] I can open the admin page: `https://YOUR_SITE.vercel.app/admin.html`
- [ ] I can log in with `admin` / `password123`
- [ ] I can see the dashboard with statistics
- [ ] I can add a new match
- [ ] I can add a new result
- [ ] I can add a news article
- [ ] I can log out

### Security Check
- [ ] I've changed the default admin password (IMPORTANT!)
- [ ] The site uses HTTPS (URL starts with `https://`)
- [ ] No error messages appear in the browser console (F12 to check)

---

## After Deployment Checklist

- [ ] I've bookmarked my live site URL
- [ ] I've shared the public site link with others
- [ ] I understand how to update the site (make changes → push to GitHub)
- [ ] I know how to check deployment status on Vercel
- [ ] I've backed up any important data

---

## Troubleshooting Checklist

If something isn't working, check these:

- [ ] Is my GitHub repository set to **Public**?
- [ ] Have I waited at least 3-5 minutes after pushing changes?
- [ ] Did I use the correct default credentials: `admin` / `password123`?
- [ ] Have I cleared my browser cache and cookies?
- [ ] Did I check the Vercel deployment logs for errors?
- [ ] Is my internet connection working properly?

---

## Quick Links for This Project

| Link | Purpose |
|------|---------|
| [Your GitHub Repo](https://github.com/YOUR_USERNAME/rockview-sports) | View your code online |
| [Your Vercel Dashboard](https://vercel.com/dashboard) | Manage your deployment |
| [Live Public Site](https://YOUR_SITE.vercel.app) | Your live website |
| [Admin Portal](https://YOUR_SITE.vercel.app/admin.html) | Manage content |

---

## Remember

✅ **Save this checklist** - Print it or keep it open while deploying  
✅ **Take your time** - Don't rush through the steps  
✅ **Test everything** - Make sure the site works after deployment  
✅ **Keep backups** - Save your code and important data  

---

**Last Updated**: May 28, 2026
