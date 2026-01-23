# Adtani Footwear Inventory System

A modern, mobile-first Progressive Web App (PWA) for managing multi-store footwear inventory.

## 🚀 Technology Stack

- **Frontend**: Next.js 15+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel
- **PWA**: next-pwa, Service Workers, IndexedDB

## 📦 Project Structure

```
footwear-inventory-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with PWA config
│   │   ├── page.tsx            # Home (redirects to dashboard/login)
│   │   ├── login/              # Authentication
│   │   ├── dashboard/          # Main dashboard
│   │   ├── inventory/          # Inventory management
│   │   ├── products/           # Product management (Owner/Manager)
│   │   └── api/                # API routes
│   ├── components/             # React components
│   └── lib/                    # Utilities and types
│       ├── supabase/           # Supabase clients
│       ├── types/              # TypeScript types
│       ├── offline-db.ts       # IndexedDB wrapper
│       └── sync.ts             # Offline sync logic
├── public/                     # Static assets
│   └── manifest.json           # PWA manifest
├── supabase-schema.sql         # Database schema
└── next.config.js              # Next.js + PWA config
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
cd footwear-inventory-app
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to SQL Editor and run the contents of `supabase-schema.sql`
4. This will create:
   - All database tables (users, stores, products, variants, inventory, stock_movements, transfers)
   - Row Level Security (RLS) policies
   - Triggers for auto-inventory updates
   - Helper views

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Supabase Dashboard → Settings → API

### 4. Add PWA Icons

⚠️ **IMPORTANT**: Add icon files to `public/` folder:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)

See [ICONS-README.md](./ICONS-README.md) for instructions.

### 5. Add Test Data (Optional)

Insert initial stores and a test user:

```sql
-- Insert stores
INSERT INTO stores (name, city, phone) VALUES
  ('Main Store', 'Mumbai', '+91-9876543210'),
  ('Branch Store', 'Pune', '+91-9876543211');

-- Create a user in Supabase Auth first, then:
INSERT INTO users (id, email, full_name, role, store_id) VALUES
  ('user-id-from-auth', 'owner@adtani.com', 'Owner Name', 'owner', NULL);
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions to Vercel.

**Quick Deploy:**

```bash
# Push to GitHub
git add .
git commit -m "Initial deployment"
git push

# Deploy to Vercel (connects to GitHub)
# Visit vercel.com and import your repository
# Add environment variables
# Deploy!
```

## 👥 User Roles & Permissions

### Owner
- ✅ Add/edit products and variants
- ✅ Allocate stock to stores
- ✅ View all inventory across stores
- ✅ Manage users and stores
- ✅ View analytics

### Manager
- ✅ Add/edit products
- ✅ Add opening stock
- ✅ Request stock transfers
- ✅ View reports

### Staff
- ✅ View inventory (own store only)
- ✅ Complete sales (−1)
- ✅ Process returns (+1)
- ✅ Scan barcodes (future)
- ❌ Cannot create products

## 🔐 Security Features

1. **Row Level Security (RLS)**
   - Staff can only access their store's data
   - Product creation restricted to Owner/Manager
   - All queries enforced at database level

2. **Authentication**
   - Supabase Auth with email/password
   - Secure session management
   - Middleware-based route protection

3. **Data Integrity**
   - No direct inventory edits
   - All changes via logged events
   - Audit trail for all transactions

## 📊 Core Features

### Event-Based Inventory

All inventory changes happen via `stock_movements`:

```typescript
// Types of events
- NEW_STOCK: Adding new stock (Owner/Manager)
- SALE: Selling an item (-1)
- RETURN: Customer return (+1)
- TRANSFER_OUT: Moving stock from store
- TRANSFER_IN: Receiving stock to store
- ADJUSTMENT: Manual correction (Owner only)
```

### Offline Support

- Actions queued in IndexedDB when offline
- Auto-sync when connection restored
- Visual indicator for offline status
- No data loss during connectivity issues

### Mobile Optimization

- Touch-optimized buttons (min 44px)
- Fast tap responses with haptic feedback
- Minimal re-renders
- Optimistic UI updates
- Bottom navigation for thumb access

## 🛠️ Development

### Key Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production test
npm run start

# Lint
npm run lint
```

## 📱 Install PWA on Devices

### Android
1. Open the app in Chrome
2. Tap menu (⋮) → "Install app"
3. App appears on home screen

### iOS
1. Open in Safari
2. Tap Share button
3. "Add to Home Screen"

## 📈 Future Enhancements

- [ ] Barcode/QR scanning
- [ ] Analytics dashboard
- [ ] Stock transfers between stores
- [ ] Low stock alerts
- [ ] Sales reports
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export to Excel/PDF

## 🐛 Troubleshooting

### "User profile not found"
- Ensure user exists in both `auth.users` and `users` table
- Check if user has correct role assigned

### "Permission denied" errors
- Verify RLS policies are enabled
- Check user's role and store_id
- Review Supabase logs

### PWA not installing
- Ensure HTTPS is enabled (required for PWA)
- Check manifest.json is accessible
- Verify service worker registration
- **Add icon files** (see ICONS-README.md)

## 📞 Support

For issues or questions:
1. Check Supabase logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments → [deployment] → Logs
3. Browser console for client-side errors

## 📄 License

Internal use only - Adtani Footwear Business

---

Built with ❤️ using Next.js, Supabase, and Vercel
