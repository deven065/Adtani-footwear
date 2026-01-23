# Deployment Guide - Adtani Footwear Inventory System

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)
- Supabase project

### Step-by-Step Deployment

#### 1. Prepare Your Database (Supabase)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose organization
   - Set project name: `adtani-footwear`
   - Set database password (save this!)
   - Choose region (closest to your users)
   - Wait 2-3 minutes for setup

2. **Run Database Schema**
   - Go to SQL Editor
   - Copy entire contents of `supabase-schema.sql`
   - Paste and click "Run"
   - Verify: Check "Table Editor" - you should see 7 tables

3. **Create First User**
   - Go to Authentication → Users
   - Click "Add User" → "Create new user"
   - Email: `owner@adtani.com`
   - Password: Set a strong password
   - Click "Create User"
   - Copy the User ID (UUID)

4. **Add User to Database**
   - Go to SQL Editor
   - Run:
   ```sql
   INSERT INTO users (id, email, full_name, role) 
   VALUES (
     'paste-user-id-here',
     'owner@adtani.com',
     'Your Name',
     'owner'
   );
   ```

5. **Add Stores**
   ```sql
   INSERT INTO stores (name, city, phone) VALUES
     ('Main Store', 'Mumbai', '+91-9876543210'),
     ('Branch Store', 'Pune', '+91-9876543211');
   ```

6. **Get API Keys**
   - Go to Settings → API
   - Copy:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **anon public key**: Long string starting with `eyJ...`

#### 2. Deploy to Vercel

**Option A: GitHub (Recommended)**

1. **Push to GitHub**
   ```bash
   cd footwear-inventory-app
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/adtani-footwear.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `./`
     - **Build Command**: `npm run build`
   
3. **Add Environment Variables**
   - Before clicking "Deploy", add:
   
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

4. **Click "Deploy"**
   - Wait 2-3 minutes
   - Your app will be live at `https://your-app.vercel.app`

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
cd footwear-inventory-app
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? Your account
# Link to existing project? No
# Project name? adtani-footwear
# Directory? ./
# Want to modify settings? No

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your Supabase anon key when prompted

# Deploy to production
vercel --prod
```

#### 3. Post-Deployment Setup

1. **Test the Deployment**
   - Open your Vercel URL
   - You should be redirected to `/login`
   - Login with your owner credentials

2. **Add More Users**
   - As owner, you can add users via Supabase directly
   - Or build an admin panel (future feature)

3. **Configure Custom Domain (Optional)**
   - Vercel Dashboard → Project → Settings → Domains
   - Add your domain: `inventory.adtanifootwear.com`
   - Update DNS records as instructed

4. **Enable HTTPS** (Automatic)
   - Vercel automatically provides SSL
   - Your app is HTTPS-ready immediately

## 📱 Install PWA on Devices

### For Staff Members

**Android:**
1. Open `https://your-app.vercel.app` in Chrome
2. Tap menu (⋮) → "Install app"
3. App appears on home screen
4. Works like a native app!

**iOS:**
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"
4. Tap "Add"

## 🔐 Security Checklist

Before going live:

- ✅ RLS policies enabled on all tables
- ✅ Environment variables set in Vercel
- ✅ Default passwords changed
- ✅ Supabase project has strong database password
- ✅ Auth email confirmations configured (Supabase → Auth → Email Templates)
- ✅ Test with different user roles

## 🔄 Making Updates

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push

# Vercel auto-deploys from main branch
# Check deployment at vercel.com/dashboard
```

### Update Database

```bash
# Connect to Supabase SQL Editor
# Run migration SQL
# Test changes

# Example: Add new column
ALTER TABLE products ADD COLUMN supplier TEXT;
```

## 📊 Monitoring

### Vercel Dashboard
- **Deployments**: See all builds
- **Analytics**: Page views, performance
- **Logs**: Runtime errors

### Supabase Dashboard
- **Database**: Browse tables
- **Auth**: Manage users
- **Logs**: Query errors, RLS denials
- **API**: Usage statistics

## 🚨 Troubleshooting Deployment

### Build Fails

**Error: "Environment variables not found"**
```bash
# Solution: Add env vars in Vercel
Settings → Environment Variables
Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
Redeploy
```

**Error: "Module not found"**
```bash
# Solution: Clear cache and rebuild
vercel --force
```

### Runtime Errors

**"Network request failed"**
- Check Supabase project is running
- Verify API keys are correct
- Check RLS policies allow access

**"User not found"**
- Ensure user exists in both `auth.users` and `users` table
- Verify user has correct `store_id` (for staff)

**"Permission denied"**
- Check user role
- Verify RLS policies
- See Supabase logs for detailed error

## 💰 Costs

### Free Tier (Sufficient for small business)

**Vercel Free:**
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Good for 100+ daily users

**Supabase Free:**
- 500MB database
- 50,000 monthly active users
- 2GB bandwidth
- Good for most small businesses

### Paid Options (if needed)

**Vercel Pro** ($20/month):
- 1TB bandwidth
- Advanced analytics
- Team collaboration

**Supabase Pro** ($25/month):
- 8GB database
- 100,000 MAU
- Daily backups
- Email support

## 🎯 Production Checklist

Before launch:

- [ ] Database schema deployed
- [ ] All RLS policies tested
- [ ] Environment variables set
- [ ] Initial stores created
- [ ] Admin user created
- [ ] App deployed and accessible
- [ ] PWA installable on test device
- [ ] Tested sale flow end-to-end
- [ ] Tested offline functionality
- [ ] Custom domain configured (if needed)
- [ ] Staff trained on app usage

## 📞 Support Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)

---

## 🎉 You're Live!

Your app is now deployed and ready to use. Share the URL with your team and start managing inventory!

**Your App**: `https://your-app.vercel.app`

**Default Login**: Use the owner credentials you created

**Next Steps**:
1. Add products
2. Add variants (sizes/colors)
3. Allocate stock to stores
4. Give staff member accounts
5. Start selling! 🚀
