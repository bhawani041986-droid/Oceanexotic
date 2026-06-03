# 🚀 OceanFresh - FREE DEPLOYMENT QUICK REFERENCE

## 📋 ZERO-COST STACK OVERVIEW

```
Frontend    → Vercel (Free)          → oceanfresh.vercel.app
Backend     → Cloudflare Workers     → api.oceanfresh.workers.dev
Database    → Supabase               → xxxxxxxx.supabase.co
Auth        → Supabase Auth          → Built-in
Storage     → Cloudflare R2          → uploads.oceanfresh.com
Mobile      → Expo EAS Build         → APK/IPA files
```

**Total Cost: ₹0/month** ✅

---

## 🔑 ACCOUNTS TO CREATE (15 minutes total)

1. **Supabase** → https://supabase.com (GitHub login)
2. **Cloudflare** → https://cloudflare.com (Email login)
3. **Vercel** → https://vercel.com (GitHub login)
4. **GitHub** → https://github.com (If not already)

---

## 📦 PHASE 1: DATABASE (2-4 hours)

### Create Supabase Project
```
1. supabase.com → New Project
2. Name: oceanfresh-db
3. Region: Singapore (closest to India)
4. Save password securely!
5. Copy credentials:
   - Project URL: https://xxxxxxxx.supabase.co
   - Anon Key: eyJhbG...
   - Service Role Key: eyJhbG... (SECRET!)
```

### Run Schema
```
1. Dashboard → SQL Editor
2. Paste: database/supabase_schema.sql (create this)
3. Run SQL
4. Verify tables created
```

### Migrate Data
```
Option A (Small data):
- Export CSV from phpMyAdmin
- Import to Supabase Table Editor

Option B (Large data):
- Run: php database/migrate_to_supabase.php
```

---

## ⚙️ PHASE 2: BACKEND API (8-12 hours)

### Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### Create Worker Project
```bash
cd c:\xampp\htdocs\FISH_MARKET
mkdir workers-api
cd workers-api
wrangler init
```

### Configure wrangler.toml
```toml
name = "oceanfresh-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://xxxxxxxx.supabase.co"
SUPABASE_KEY = "your-service-role-key"
JWT_SECRET = "your-secret"
```

### Convert PHP → TypeScript
```
Priority Order:
1. Auth endpoints (login, register) ← Start here
2. Products (list, get, create)
3. Orders (list, create, update)
4. Users (profile, addresses)
5. Reviews, Chat, etc.

Example conversion:
api/auth/login.php → workers-api/src/routes/auth.ts
```

### Deploy Worker
```bash
wrangler dev          # Test locally
wrangler deploy       # Deploy to production

# Output: https://oceanfresh-api.yourusername.workers.dev
```

### Test Endpoint
```bash
curl https://oceanfresh-api.yourusername.workers.dev/health
# Expected: {"status":"ok"}
```

---

## 🌐 PHASE 3: FRONTEND (2-3 hours)

### Push to GitHub
```bash
cd c:\xampp\htdocs\FISH_MARKET
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/oceanfresh.git
git push -u origin main
```

### Deploy to Vercel
```bash
# Option 1: Dashboard (Easiest)
# 1. vercel.com → Add New Project
# 2. Import GitHub repo
# 3. Framework: Next.js
# 4. Add env vars
# 5. Deploy

# Option 2: CLI
npm install -g vercel
vercel login
vercel
```

### Environment Variables (Vercel Dashboard)
```
NEXT_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Update Config Files
```typescript
// src/config/api.ts
export const FULL_API_URL = process.env.NEXT_PUBLIC_API_URL;

// next.config.ts
// REMOVE: async rewrites() { ... } ← No longer needed
```

### Test
```
https://oceanfresh.vercel.app
```

---

## 📱 PHASE 4: MOBILE APP (2-3 hours)

### Update API Endpoint
```typescript
// apps/customer-mobile/services/api.ts
const BASE_URL = 'https://oceanfresh-api.yourusername.workers.dev';
```

### Update .env
```env
EXPO_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Build APK
```bash
cd apps/customer-mobile
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview

# Wait 10-15 minutes
# Download APK from Expo Dashboard
```

### Test APK
```
1. Transfer APK to Android phone
2. Install (enable "Unknown Sources")
3. Test login, browse products, place order
```

---

## 🔐 PHASE 5: AUTHENTICATION (3-4 hours)

### Enable Supabase Auth
```
1. Dashboard → Authentication → Providers
2. Enable Email/Password
3. Configure:
   - Email confirmations: Optional
   - Password strength: Medium
```

### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Update Auth Service
```typescript
// Replace JWT localStorage with Supabase
// Use: supabase.auth.signInWithPassword()
// Use: supabase.auth.signUp()
// Use: supabase.auth.signOut()
```

---

## 📦 PHASE 6: FILE STORAGE (1-2 hours)

### Create R2 Bucket
```
1. Cloudflare Dashboard → R2
2. Create Bucket: oceanfresh-uploads
3. Location: APAC
4. Create API Token (Read & Write)
5. Save credentials
```

### Update Upload Endpoint
```typescript
// workers-api/src/routes/upload.ts
// Use @aws-sdk/client-s3 to upload to R2
// Return public URL
```

### Add Env Vars (Workers)
```toml
[vars]
R2_ACCOUNT_ID = "your-account-id"
R2_ACCESS_KEY_ID = "your-access-key"
R2_SECRET_ACCESS_KEY = "your-secret-key"
```

---

## 🌍 PHASE 7: CUSTOM DOMAIN (Optional, 1 hour)

### Vercel Domain
```
1. Vercel → Project → Settings → Domains
2. Add: oceanexotic.com
3. Update DNS at registrar:
   Type: A
   Name: @
   Value: 76.76.21.21
4. Wait 1-24 hours for DNS propagation
```

### Workers Domain
```
1. Cloudflare → Workers → oceanfresh-api
2. Add Route: api.oceanexotic.com/*
3. DNS:
   Type: CNAME
   Name: api
   Value: oceanfresh-api.yourusername.workers.dev
```

---

## ✅ DEPLOYMENT CHECKLIST

### Before Going Live
- [ ] Database migrated and tested
- [ ] All API endpoints converted
- [ ] Worker deployed and responding
- [ ] Frontend deployed to Vercel
- [ ] Mobile APK built and tested
- [ ] Authentication working
- [ ] File uploads working
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Error handling in place
- [ ] Mobile app points to production API

### Testing Checklist
- [ ] User registration
- [ ] User login/logout
- [ ] Browse products
- [ ] Add to cart
- [ ] Place order
- [ ] View order history
- [ ] Update profile
- [ ] Add address
- [ ] Upload images (if applicable)
- [ ] Mobile app login
- [ ] Mobile app browsing
- [ ] Mobile app checkout

### Monitoring Setup
- [ ] Vercel Analytics (free)
- [ ] Cloudflare Workers Analytics (free)
- [ ] Supabase Dashboard monitoring
- [ ] Error tracking: Sentry (free tier)

---

## 📊 USAGE LIMITS (Free Tier)

| Service | Limit | Current | Status |
|---------|-------|---------|--------|
| Vercel Bandwidth | 100GB/mo | ~0GB | ✅ 0% used |
| Workers Requests | 100k/day | 0 | ✅ 0% used |
| Supabase DB | 500MB | ~0MB | ✅ 0% used |
| Supabase Users | 50k MAU | 0 | ✅ 0% used |
| R2 Storage | 10GB | ~0GB | ✅ 0% used |

---

## 🆘 COMMON ISSUES & FIXES

### CORS Error
```typescript
// Add to workers-api/src/index.ts
app.use('/*', cors({
  origin: ['https://oceanfresh.vercel.app', '*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### Build Fails on Vercel
```
1. Check build logs
2. Common fixes:
   - Add missing dependencies to package.json
   - Set ignoreBuildErrors: true in next.config.ts
   - Verify all env vars are set
```

### Mobile Can't Connect
```
1. Check BASE_URL in services/api.ts
2. Must be: https://oceanfresh-api.yourusername.workers.dev
3. NOT: http://localhost or http://192.168.x.x
```

### Database Connection Error
```
1. Verify SUPABASE_URL and SUPABASE_KEY in wrangler.toml
2. Check service role key (not anon key)
3. Test: curl https://xxxxxxxx.supabase.co/rest/v1/
```

---

## 🚀 DEPLOYMENT COMMANDS CHEAT SHEET

### Backend (Cloudflare Workers)
```bash
cd workers-api
wrangler dev              # Test locally
wrangler deploy           # Deploy to production
wrangler tail             # View live logs
```

### Frontend (Vercel)
```bash
vercel                    # Preview deploy
vercel --prod            # Production deploy
vercel logs              # View logs
```

### Mobile (Expo)
```bash
eas build --platform android          # Build APK
eas build --platform android --profile preview  # Free tier
eas submit --platform android         # Submit to Play Store
```

---

## 📞 SUPPORT RESOURCES

- **Supabase Discord:** https://discord.supabase.com
- **Cloudflare Community:** https://community.cloudflare.com
- **Vercel Discord:** https://vercel.com/discord
- **Expo Forums:** https://forums.expo.dev

---

## 💡 PRO TIPS

1. **Start with Supabase** → Everything else depends on it
2. **Test locally first** → `wrangler dev` before `wrangler deploy`
3. **Use preview deployments** → Vercel auto-creates preview URLs
4. **Monitor usage** → All dashboards show free tier usage
5. **Backup regularly** → Export Supabase data weekly
6. **Use TypeScript** → Catches errors before deployment
7. **Version control** → Commit before each deploy
8. **Environment variables** → Never commit secrets to Git

---

## 📈 WHEN TO UPGRADE

### Signs You Need Paid Plan:
- ⚠️ Vercel bandwidth > 80GB/month
- ⚠️ Workers requests > 80k/day
- ⚠️ Supabase DB > 400MB
- ⚠️ Users complaining about pauses
- ⚠️ Need custom domains with SSL

### Upgrade Path:
```
₹0/month → ₹500/month → ₹2,000/month → ₹5,000/month
(Free)     (Starter)      (Growth)       (Scale)
```

---

**Estimated Total Setup Time: 22-34 hours (3-5 days)**

**Cost: ₹0/month** 🎉

---

**Need help? Reference the full guide: `FREE_HOSTING_PLAN.md`**
