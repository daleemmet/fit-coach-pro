# FitCoach Pro — Deployment Guide

## What's in this folder
- `src/App.jsx` — the full app
- `src/index.js` — React entry point
- `public/index.html` — HTML shell
- `package.json` — project config
- `vercel.json` — Vercel deployment config

---

## How to deploy to Vercel (free, ~10 minutes)

### Step 1 — Create a free GitHub account
Go to https://github.com and sign up (free).
You need this to store the code so Vercel can read it.

### Step 2 — Create a new GitHub repository
1. Click the "+" icon top right → "New repository"
2. Name it: fitcoach-pro
3. Set to Private
4. Click "Create repository"
5. On the next page click "uploading an existing file"
6. Drag the ENTIRE fitcoach-pro folder contents into the upload area
   (select all files: App.jsx, index.js, index.html, package.json, vercel.json, .gitignore)
7. Click "Commit changes"

### Step 3 — Create a free Vercel account
Go to https://vercel.com and click "Sign Up"
Choose "Continue with GitHub" — this links them together automatically.

### Step 4 — Deploy
1. On the Vercel dashboard click "Add New Project"
2. Find "fitcoach-pro" in the list and click "Import"
3. Leave all settings as default
4. Click "Deploy"
5. Wait about 60 seconds — Vercel builds and deploys it

### Step 5 — Get your URL
Vercel gives you a URL like: https://fitcoach-pro.vercel.app
That's it! Open it on any device — phone, tablet, computer.

---

## Adding to iPhone home screen (makes it feel like a real app)
1. Open the URL in Safari on iPhone
2. Tap the Share button (box with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name it "FitCoach Pro" → tap Add
It now appears on the home screen with a full-screen app experience.

---

## Important notes
- All data saves in the browser's local storage on each device
- Data does NOT sync between devices automatically
- If he clears browser data/cache, the workout data will be lost
- Recommend doing a CSV export periodically as a backup

---

## Making updates in the future
If you want to update the app later:
1. Go to your GitHub repository
2. Click on the file you want to update
3. Click the pencil (edit) icon
4. Paste the new version
5. Click "Commit changes"
Vercel automatically re-deploys within 60 seconds.
