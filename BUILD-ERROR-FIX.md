# ⚠️ Build Error: Environment Variables Required

If you see this error when running `npm run build`:

```
Error: @supabase/ssr: Your project's URL and API key are required
```

## Solution

You need to create a `.env.local` file **before** building.

### Quick Fix:

1. Create `.env.local` in the project root
2. Add these two lines (with your actual values):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Get these values from:
   - Supabase Dashboard → Settings → API

4. Try building again:

```bash
npm run build
```

## For Vercel Deployment

**Good news:** You don't need to build locally!

Vercel will build for you. Just make sure to:

1. Add environment variables in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. Deploy normally - Vercel handles the build

## Why This Happens

Next.js pre-renders pages at build time. Since our pages use Supabase, it needs the credentials even during build (though actual data fetching only happens at runtime).

This is **normal and expected behavior** for SSR/SSG apps.

---

**Next Steps:**
1. If testing locally: Add `.env.local` with your Supabase keys
2. If deploying to Vercel: Add env vars in Vercel Dashboard

See [QUICKSTART.md](./QUICKSTART.md) for complete setup instructions.
