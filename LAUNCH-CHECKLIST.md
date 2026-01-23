# 📋 Pre-Launch Checklist

Use this checklist before launching your Adtani Footwear Inventory System to production.

## ✅ Database Setup

- [ ] Supabase project created
- [ ] Database password saved securely
- [ ] `supabase-schema.sql` executed successfully
- [ ] All 7 tables created (users, stores, products, product_variants, inventory, stock_movements, stock_transfers)
- [ ] RLS policies enabled on all tables
- [ ] Test user created in Supabase Auth
- [ ] User added to `users` table with correct role
- [ ] At least one store added to `stores` table

## ✅ Environment Configuration

- [ ] `.env.local` created with correct values
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] Environment variables tested locally

## ✅ PWA Setup

- [ ] `icon-192x192.png` added to `public/`
- [ ] `icon-512x512.png` added to `public/`
- [ ] Icons display correctly
- [ ] `manifest.json` updated with correct app name
- [ ] PWA installable on test device

## ✅ Code & Dependencies

- [ ] All dependencies installed (`npm install`)
- [ ] No build errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint errors (`npm run lint`)
- [ ] Project builds successfully

## ✅ Deployment

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] GitHub repository connected
- [ ] Environment variables added in Vercel
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] HTTPS working (automatic with Vercel)

## ✅ Functionality Testing

### Authentication
- [ ] Can login with owner account
- [ ] Can logout
- [ ] Wrong password shows error
- [ ] Redirects work correctly (login → dashboard)

### Owner Role
- [ ] Can access Products page
- [ ] Can create new product
- [ ] Can add variants (size/color)
- [ ] Can allocate stock to stores
- [ ] Can view all stores' inventory
- [ ] Navigation shows all 5 tabs

### Staff Role (if created)
- [ ] Can login with staff account
- [ ] Can only see own store's inventory
- [ ] Can complete sale (−1)
- [ ] Can process return (+1)
- [ ] Cannot access Products page
- [ ] Navigation shows 3 tabs only
- [ ] Inventory updates immediately after action

### Search & UI
- [ ] Search works (by brand, model, barcode)
- [ ] Results filter correctly
- [ ] Product detail page loads
- [ ] All buttons respond to taps
- [ ] Navigation works on all pages
- [ ] Mobile layout looks correct

### Offline Support
- [ ] Offline indicator shows when disconnected
- [ ] Can perform sale while offline
- [ ] Action queued in IndexedDB
- [ ] Auto-syncs when reconnected
- [ ] Sync indicator shows during sync

## ✅ Security Verification

- [ ] Staff user cannot see other stores' inventory
- [ ] Staff user cannot access /products
- [ ] Staff user cannot create products
- [ ] Owner can see all stores
- [ ] RLS policies block unauthorized queries (check Supabase logs)
- [ ] No sensitive data in console.log
- [ ] Environment variables not in git

## ✅ Data Integrity

- [ ] Sale reduces inventory by 1
- [ ] Return increases inventory by 1
- [ ] Inventory never goes negative (or has validation)
- [ ] All changes logged in `stock_movements`
- [ ] `created_by` field populated correctly
- [ ] Timestamps accurate

## ✅ Mobile Experience

- [ ] App installable on Android (Chrome)
- [ ] App installable on iOS (Safari)
- [ ] Icon appears on home screen
- [ ] App opens in standalone mode (no browser UI)
- [ ] Bottom navigation accessible with thumb
- [ ] Buttons at least 44px (touch-friendly)
- [ ] Text readable without zoom
- [ ] Sale flow takes < 10 seconds

## ✅ Performance

- [ ] Page loads in < 3 seconds
- [ ] No unnecessary re-renders
- [ ] Images optimized (if using images)
- [ ] Lighthouse Mobile score > 80
- [ ] Lighthouse PWA score > 80
- [ ] No console errors in production

## ✅ Documentation

- [ ] README.md reviewed
- [ ] DEPLOYMENT.md followed
- [ ] Team knows how to use the app
- [ ] Support contact established
- [ ] Backup plan documented

## ✅ Business Readiness

- [ ] All stores added to database
- [ ] Staff accounts created for all users
- [ ] Staff trained on basic usage (sale/return)
- [ ] Owner/Manager trained on product creation
- [ ] Emergency contact designated
- [ ] First 5-10 products added with variants
- [ ] Opening stock allocated to stores

## 🚨 Emergency Rollback Plan

If something goes wrong:

1. **Database Issue**: 
   - Supabase Dashboard → SQL Editor → Run backup SQL
   - Check logs for errors

2. **Deployment Issue**:
   - Vercel Dashboard → Deployments → Redeploy previous version
   - Or: `vercel --prod` to redeploy

3. **Auth Issue**:
   - Check Supabase Auth → Users
   - Verify user in both `auth.users` AND `users` table

4. **Critical Bug**:
   - Temporarily disable affected feature
   - Roll back to previous git commit
   - Fix and redeploy

## 📞 Support Contacts

- **Supabase Support**: [supabase.com/support](https://supabase.com/support)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Internal Contact**: [Your Name/Phone]

## ✅ Final Verification

Before announcing to team:

- [ ] Owner login works
- [ ] At least 1 staff login works
- [ ] Complete one full sale transaction
- [ ] Verify inventory reduced correctly
- [ ] Test on actual mobile device
- [ ] Install PWA successfully
- [ ] Complete sale from installed PWA

## 🎉 Launch!

Once all boxes checked:

1. Announce app URL to team
2. Share login credentials securely
3. Provide quick demo/training
4. Monitor first day for issues
5. Gather feedback

---

**Last Checked:** [Date]
**Checked By:** [Name]
**Ready to Launch:** [ ] Yes / [ ] No

---

## Post-Launch (First Week)

- [ ] Day 1: Check Supabase logs
- [ ] Day 1: Check Vercel logs
- [ ] Day 3: Gather staff feedback
- [ ] Day 7: Review analytics
- [ ] Day 7: Address any issues
- [ ] Day 7: Plan enhancements

**Success Criteria:**
- Zero critical bugs
- All staff comfortable using app
- Inventory accurately tracked
- Positive user feedback
