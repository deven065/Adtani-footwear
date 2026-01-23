# 🚀 Quick Start Guide

Get your Adtani Footwear Inventory System running in **15 minutes**!

## Prerequisites

- Node.js 18+ installed
- GitHub account (for deployment)
- Supabase account (free)
- Vercel account (free)

## Step 1: Setup Supabase (5 min)

1. Go to [supabase.com](https://supabase.com) → Sign up/Login
2. Click **"New Project"**
3. Enter:
   - Name: `adtani-footwear`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait 2-3 minutes for setup
5. Go to **SQL Editor** → New query
6. Copy entire contents of `supabase-schema.sql` and paste
7. Click **"Run"** → Success! ✅

## Step 2: Get API Keys (1 min)

1. In Supabase, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`

## Step 3: Create Admin User (2 min)

1. In Supabase, go to **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - Email: `admin@yourbusiness.com`
   - Password: Strong password
4. Click **"Create User"**
5. Copy the **User ID** (UUID)
6. Go to **SQL Editor**, run:

```sql
-- Replace 'paste-user-id-here' with the UUID you copied
INSERT INTO users (id, email, full_name, role) 
VALUES (
  'paste-user-id-here',
  'admin@yourbusiness.com',
  'Your Name',
  'owner'
);

-- Add your stores
INSERT INTO stores (name, city, phone) VALUES
  ('Main Store', 'Your City', '+91-XXXXXXXXXX');
```

## Step 4: Configure Project (1 min)

Create `.env.local` file in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Paste the values from Step 2.

## Step 5: Add PWA Icons (2 min)

⚠️ **Important for mobile installation**

Quick option:
1. Go to [favicon.io/favicon-generator](https://favicon.io/favicon-generator/)
2. Create icon with text "AF"
3. Download and extract
4. Rename files:
   - `android-chrome-192x192.png` → `icon-192x192.png`
   - `android-chrome-512x512.png` → `icon-512x512.png`
5. Move to `public/` folder

## Step 6: Test Locally (2 min)

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Login with your admin credentials! 🎉

## Step 7: Deploy to Vercel (2 min)

```bash
# Initialize git and push to GitHub
git add .
git commit -m "Initial commit"
git push
```

Then:
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Add environment variables (from Step 2)
5. Click **"Deploy"** → Done! 🚀

Your app is now live at: `https://your-app.vercel.app`

## ✅ You're Ready!

**Test the full flow:**
1. Login as owner
2. Add a product (e.g., "Nike Air Max")
3. Add variant (Size 10, Black)
4. Allocate 5 units to Main Store
5. Create a staff user (in Supabase Auth + users table)
6. Login as staff
7. Complete a sale
8. Verify inventory reduced to 4

## 📱 Install on Mobile

**Android:**
- Open app in Chrome
- Tap menu → "Install app"

**iOS:**
- Open in Safari
- Tap Share → "Add to Home Screen"

## 🆘 Need Help?

- **Setup Issues**: Check [README.md](./README.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database Errors**: Check Supabase Logs
- **Code Errors**: Check browser console

## 🎯 Next Steps

1. **Add more users** (staff members for each store)
2. **Add products** (your inventory)
3. **Train staff** (show them sale/return buttons)
4. **Monitor** (check Supabase dashboard for activity)

---

**Time to first sale: ~15 minutes** ⚡

Need detailed info? → [README.md](./README.md)
Want to customize? → Start with `src/app/` components

**Happy selling!** 🎉👟
