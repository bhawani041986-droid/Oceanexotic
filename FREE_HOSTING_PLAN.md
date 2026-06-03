# 🌊 OceanFresh FISH_MARKET - COMPLETE FREE HOSTING PLAN (₹0/month)

## 📊 CURRENT ARCHITECTURE ANALYSIS

### Your Project Structure:
```
FISH_MARKET/
├── Frontend: Next.js 15 + React 19 + TypeScript
├── Backend API: PHP 8.2+ (MySQL PDO)
├── Database: MySQL 8.0 (currently on XAMPP port 3307)
├── Mobile App: React Native Expo SDK 54
├── File Storage: public/uploads/
└── Auth: Custom JWT (localStorage)
```

### Current Tech Stack:
- **Frontend:** Next.js 15, React 19, TailwindCSS 4, Framer Motion, Zustand
- **Backend:** PHP APIs (70+ endpoints across 12 modules)
- **Database:** MySQL with 15+ tables (users, products, orders, etc.)
- **Mobile:** Expo React Native (customer + seller apps)
- **Images:** Local file system (public/uploads/)

---

## 🎯 PROPOSED FREE STACK ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (Web)                       │
│              Vercel (Free Tier)                      │
│         oceanfresh.vercel.app                        │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ HTTPS API Calls
                       │
┌──────────────────────▼──────────────────────────────┐
│              BACKEND API LAYER                       │
│         Cloudflare Workers (Free)                    │
│     api.oceanfresh.workers.dev                       │
│                                                      │
│  Translates PHP → JavaScript/TypeScript             │
│  Handles: Auth, Products, Orders, etc.              │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ PostgreSQL Protocol
                       │
┌──────────────────────▼──────────────────────────────┐
│               DATABASE                               │
│          Supabase (Free Tier)                        │
│     xxxxxxxx.supabase.co                             │
│                                                      │
│  PostgreSQL with Row Level Security                  │
│  Auto-migration from MySQL schema                    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           AUTHENTICATION                             │
│        Supabase Auth (Free)                          │
│   JWT Tokens, Email/Password, OAuth                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           FILE STORAGE                               │
│       Cloudflare R2 (Free 10GB)                      │
│   Product images, user uploads                       │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│           MOBILE APP                                 │
│   Expo EAS Build (Free 30 builds/month)             │
│   Points to: api.oceanfresh.workers.dev              │
└─────────────────────────────────────────────────────┘
```

---

## 💰 COST BREAKDOWN (₹0/month)

| Service | Plan | Limits | Cost |
|---------|------|--------|------|
| **Vercel** | Hobby | 100GB bandwidth, 100k serverless req/month | **₹0** |
| **Cloudflare Workers** | Free | 100k requests/day | **₹0** |
| **Supabase** | Free | 500MB DB, 1GB storage, 50k MAU | **₹0** |
| **Cloudflare R2** | Free | 10GB storage, 1M reads/month | **₹0** |
| **Expo EAS** | Free | 30 builds/month | **₹0** |
| **TOTAL** | | | **₹0/month** ✅ |

---

## 📋 PHASE 1: DATABASE MIGRATION (MySQL → Supabase PostgreSQL)

### Why Supabase?
- ✅ Free PostgreSQL database (500MB)
- ✅ Built-in authentication
- ✅ Real-time subscriptions (for chat, orders)
- ✅ Auto-generated APIs
- ✅ Row-level security
- ✅ Dashboard for data management

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up with GitHub account
3. Click "New Project"
4. Fill in:
   - **Project name:** `oceanfresh-db`
   - **Database password:** (generate strong password, save it!)
   - **Region:** `Southeast Asia (Singapore)` (closest to India)
5. Wait 2-3 minutes for provisioning
6. Copy these credentials from Settings → API:
   - **Project URL:** `https://xxxxxxxx.supabase.co`
   - **Anon/Public Key:** `eyJhbG...`
   - **Service Role Key:** `eyJhbG...` (keep secret!)

---

### Step 1.2: Convert MySQL Schema to PostgreSQL

Your current MySQL schema needs conversion. Here's the mapping:

**Create file:** `database/supabase_schema.sql`

```sql
-- Users Table (MySQL → PostgreSQL)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  name VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Addresses
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(100),
  hotel_name VARCHAR(255),
  room_no VARCHAR(50),
  jetty VARCHAR(255),
  address_line1 TEXT,
  city VARCHAR(100),
  pincode VARCHAR(20),
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  stock_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies (Examples)
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (status = 'approved');
```

---

### Step 1.3: Migrate Existing Data

**Option A: Manual Migration (Recommended for < 1000 records)**

1. Export from MySQL:
```bash
# In XAMPP phpMyAdmin
# 1. Select ocean_fresh database
# 2. Click "Export"
# 3. Choose "Custom" format
# 4. Select all tables
# 5. Format: CSV
# 6. Download
```

2. Import to Supabase:
```bash
# In Supabase Dashboard
# 1. Go to Table Editor
# 2. Select table (e.g., "users")
# 3. Click "Insert" → "Import from CSV"
# 4. Upload CSV file
# 5. Map columns
# 6. Import
```

**Option B: Automated Migration Script**

Create file: `database/migrate_to_supabase.php`

```php
<?php
require_once __DIR__ . '/../db.php';

// Supabase connection
$supebase_url = 'https://xxxxxxxx.supabase.co/rest/v1';
$supabase_key = 'your-service-role-key';

// Get all users from MySQL
$stmt = $pdo->query("SELECT * FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($users as $user) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "$supabase_url/users");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "apikey: $supabase_key",
        "Authorization: Bearer $supabase_key",
        "Content-Type: application/json",
        "Prefer: resolution=merge-duplicates"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'role' => $user['role'],
        'phone' => $user['phone'] ?? null,
    ]));
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    echo "Migrated user: {$user['email']}\n";
}

echo "Migration complete!\n";
?>
```

Run: `php database/migrate_to_supabase.php`

---

## 📋 PHASE 2: BACKEND API MIGRATION (PHP → Cloudflare Workers)

### Why Cloudflare Workers?
- ✅ 100,000 requests/day FREE
- ✅ Global edge network (fast in India)
- ✅ No server management
- ✅ TypeScript/JavaScript support
- ✅ Auto-scaling

### Step 2.1: Setup Cloudflare Workers

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create worker project:
```bash
cd c:\xampp\htdocs\FISH_MARKET
mkdir workers-api
cd workers-api
wrangler init
```

4. Configure `wrangler.toml`:
```toml
name = "oceanfresh-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
SUPABASE_URL = "https://xxxxxxxx.supabase.co"
SUPABASE_KEY = "your-service-role-key"
JWT_SECRET = "your-jwt-secret-here"

[[d1_databases]]
binding = "DB"
database_name = "oceanfresh-db"
database_id = "your-d1-database-id"
```

---

### Step 2.2: Convert PHP APIs to TypeScript

**Example: Auth API Conversion**

**Current PHP:** `api/auth/login.php`
```php
<?php
require_once '../../db.php';
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'];
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password_hash'])) {
    $token = jwt_encode(['user_id' => $user['id']]);
    echo json_encode(['token' => $token, 'user' => $user]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
?>
```

**New TypeScript:** `workers-api/src/routes/auth.ts`
```typescript
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { sign } from 'hono/jwt';

const auth = new Hono();

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_KEY
  );
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error || !user) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  // Verify password (you'll need to hash properly)
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }
  
  const token = await sign(
    { user_id: user.id, role: user.role },
    c.env.JWT_SECRET
  );
  
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

export default auth;
```

---

### Step 2.3: Main Worker Entry Point

**File:** `workers-api/src/index.ts`
```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import auth from './routes/auth';
import products from './routes/products';
import orders from './routes/orders';
import users from './routes/users';

const app = new Hono();

// CORS for web + mobile
app.use('/*', cors({
  origin: ['https://oceanfresh.vercel.app', '*'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.route('/auth', auth);
app.route('/products', products);
app.route('/orders', orders);
app.route('/users', users);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

---

### Step 2.4: Deploy to Cloudflare Workers

```bash
# Deploy
wrangler deploy

# Output:
# ✓ Deployed to: https://oceanfresh-api.yourusername.workers.dev
```

**Test endpoint:**
```bash
curl https://oceanfresh-api.yourusername.workers.dev/health
# Response: {"status":"ok"}
```

---

## 📋 PHASE 3: FRONTEND DEPLOYMENT (Vercel)

### Step 3.1: Push to GitHub

```bash
cd c:\xampp\htdocs\FISH_MARKET

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit: OceanFresh marketplace"

# Create GitHub repo
# Go to github.com → New Repository → Create

# Add remote
git remote add origin https://github.com/yourusername/oceanfresh.git
git push -u origin main
```

---

### Step 3.2: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```
7. Click "Deploy"
8. Wait 2-3 minutes
9. **Live at:** `https://oceanfresh.vercel.app` ✅

**Option B: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd c:\xampp\htdocs\FISH_MARKET
vercel

# Follow prompts
# Project name: oceanfresh
# Framework: Next.js
# Deploy to: Production

# First deploy: ~3-5 minutes
```

---

### Step 3.3: Update API Configuration

**File:** `src/config/api.ts` (create if doesn't exist)

```typescript
export const FULL_API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  'https://oceanfresh-api.yourusername.workers.dev';
```

**Update:** `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'xxxxxxxx.supabase.co',
        pathname: '**',
      },
    ],
  },
  // Remove PHP rewrites (no longer needed)
  // async rewrites() { ... } ← DELETE THIS
};

export default nextConfig;
```

---

## 📋 PHASE 4: FILE STORAGE (Cloudflare R2)

### Why R2?
- ✅ 10GB storage FREE
- ✅ 1 million reads/month FREE
- ✅ No egress fees (unlike AWS S3)
- ✅ S3-compatible API

### Step 4.1: Create R2 Bucket

1. Go to Cloudflare Dashboard → R2
2. Click "Create Bucket"
3. Name: `oceanfresh-uploads`
4. Location: `APAC` (Asia Pacific)
5. Create an API Token:
   - Go to R2 → Manage R2 API Tokens
   - Create token with "Object Read & Write" permissions
   - Save credentials

---

### Step 4.2: Update Upload API

**Current:** `api/upload.php` (local file system)

**New:** `workers-api/src/routes/upload.ts`

```typescript
import { Hono } from 'hono';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const upload = new Hono();

upload.post('/image', async (c) => {
  const formData = await c.req.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }
  
  // Initialize R2 client
  const r2 = new S3Client({
    region: 'auto',
    endpoint: `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: c.env.R2_ACCESS_KEY_ID,
      secretAccessKey: c.env.R2_SECRET_ACCESS_KEY,
    },
  });
  
  // Generate unique filename
  const filename = `${Date.now()}-${file.name}`;
  const arrayBuffer = await file.arrayBuffer();
  
  // Upload to R2
  await r2.send(new PutObjectCommand({
    Bucket: 'oceanfresh-uploads',
    Key: `products/${filename}`,
    Body: Buffer.from(arrayBuffer),
    ContentType: file.type,
  }));
  
  // Return public URL
  const publicUrl = `https://uploads.oceanfresh.com/${filename}`;
  
  return c.json({ url: publicUrl });
});

export default upload;
```

---

## 📋 PHASE 5: AUTHENTICATION (Supabase Auth)

### Step 5.1: Enable Supabase Auth

1. Go to Supabase Dashboard → Authentication
2. Enable "Email/Password" provider
3. Configure:
   - ✅ Enable email confirmations (optional)
   - ✅ Set password requirements
   - ✅ Configure redirect URLs

---

### Step 5.2: Update Frontend Auth

**Install Supabase client:**
```bash
npm install @supabase/supabase-js
```

**Create:** `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Update:** `src/services/authService.ts`

```typescript
import { supabase } from '@/lib/supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  async register(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    
    if (error) throw error;
    return data;
  },
  
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
};
```

---

## 📋 PHASE 6: MOBILE APP CONFIGURATION

### Step 6.1: Update API Endpoint

**File:** `apps/customer-mobile/services/api.ts`

```typescript
import axios from 'axios';

// Production URL (Cloudflare Workers)
const BASE_URL = 'https://oceanfresh-api.yourusername.workers.dev';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

**File:** `apps/customer-mobile/.env`

```env
EXPO_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

### Step 6.2: Build APK (Free with Expo)

```bash
cd apps/customer-mobile

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure build
eas build:configure

# Build APK (Android)
eas build --platform android --profile preview

# Free tier: 30 builds/month
# Build time: ~10-15 minutes
```

**Download APK from:** Expo Dashboard → Builds

---

## 📋 PHASE 7: DOMAIN & SSL (FREE)

### Step 7.1: Custom Domain on Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `oceanexotic.com` (or your domain)
3. Vercel provides DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```
4. Update in your domain registrar (GoDaddy, Namecheap, etc.)
5. **Free SSL:** Automatic via Vercel ✅

---

### Step 7.2: Custom Domain for API

1. Go to Cloudflare Dashboard → Workers → oceanfresh-api
2. Add Route: `api.oceanexotic.com/*`
3. Update DNS in Cloudflare:
   ```
   Type: CNAME
   Name: api
   Value: oceanfresh-api.yourusername.workers.dev
   ```
4. **Free SSL:** Automatic via Cloudflare ✅

---

## 📋 COMPLETE DEPLOYMENT CHECKLIST

### Phase 1: Database (Day 1)
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Convert MySQL schema to PostgreSQL
- [ ] Run schema in Supabase SQL Editor
- [ ] Migrate existing data (CSV or script)
- [ ] Test database connection
- [ ] Enable Row Level Security
- [ ] Create policies

### Phase 2: Backend API (Day 2-3)
- [ ] Install Wrangler CLI
- [ ] Create Cloudflare Workers project
- [ ] Convert auth endpoints (login, register)
- [ ] Convert product endpoints (CRUD)
- [ ] Convert order endpoints
- [ ] Convert user endpoints
- [ ] Add CORS configuration
- [ ] Test locally with `wrangler dev`
- [ ] Deploy: `wrangler deploy`
- [ ] Test production endpoints

### Phase 3: Frontend (Day 4)
- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import repository
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test web app
- [ ] Fix any build errors
- [ ] Add custom domain (optional)

### Phase 4: Storage (Day 5)
- [ ] Create Cloudflare R2 bucket
- [ ] Generate API token
- [ ] Update upload endpoints
- [ ] Test file upload
- [ ] Update image URLs in database

### Phase 5: Authentication (Day 5-6)
- [ ] Enable Supabase Auth
- [ ] Configure email provider
- [ ] Update frontend auth service
- [ ] Test login/register flow
- [ ] Update JWT handling

### Phase 6: Mobile App (Day 7)
- [ ] Update API endpoints in .env
- [ ] Test with Expo Go
- [ ] Configure EAS Build
- [ ] Build APK: `eas build --platform android`
- [ ] Download and test APK
- [ ] Submit to Play Store (optional)

### Phase 7: Testing & Optimization (Day 8-10)
- [ ] Test all web features
- [ ] Test all mobile features
- [ ] Monitor Cloudflare Workers usage
- [ ] Monitor Supabase usage
- [ ] Optimize slow queries
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Create backup strategy

---

## 🔧 ENVIRONMENT VARIABLES

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### Cloudflare Workers (Backend)
```toml
[vars]
SUPABASE_URL = "https://xxxxxxxx.supabase.co"
SUPABASE_KEY = "your-service-role-key"
JWT_SECRET = "your-jwt-secret-here"
R2_ACCOUNT_ID = "your-account-id"
R2_ACCESS_KEY_ID = "your-access-key"
R2_SECRET_ACCESS_KEY = "your-secret-key"
```

### Mobile App
```env
EXPO_PUBLIC_API_URL=https://oceanfresh-api.yourusername.workers.dev
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

## 📊 USAGE LIMITS & MONITORING

### Vercel (Hobby Plan)
- ✅ **Bandwidth:** 100GB/month
- ✅ **Serverless Functions:** 100GB-hours/month
- ✅ **Build Minutes:** 6,000 minutes/month
- ⚠️ **Overage:** Project pauses (no extra charge)

### Cloudflare Workers (Free)
- ✅ **Requests:** 100,000/day
- ✅ **CPU Time:** 10ms per request
- ⚠️ **Overage:** Requests blocked (no extra charge)

### Supabase (Free)
- ✅ **Database Size:** 500MB
- ✅ **File Storage:** 1GB
- ✅ **Bandwidth:** 5GB/month
- ✅ **Active Users:** 50,000 MAU
- ⚠️ **Overage:** Project paused (no extra charge)

### Cloudflare R2 (Free)
- ✅ **Storage:** 10GB
- ✅ **Read Operations:** 1M/month
- ✅ **Write Operations:** 100K/month
- ⚠️ **Overage:** Requests blocked (no extra charge)

---

## 🚀 QUICK START COMMANDS

### Local Development
```bash
# Frontend
cd c:\xampp\htdocs\FISH_MARKET
npm install
npm run dev
# http://localhost:3000

# Mobile
cd apps/customer-mobile
npm install
npm run dev:phone
# Scan QR with Expo Go

# Backend (Workers)
cd workers-api
npm install
wrangler dev
# http://localhost:8787
```

### Production Deploy
```bash
# Backend
cd workers-api
wrangler deploy

# Frontend
cd c:\xampp\htdocs\FISH_MARKET
vercel --prod

# Mobile
cd apps/customer-mobile
eas build --platform android --profile preview
```

---

## 🆘 TROUBLESHOOTING

### Issue: CORS errors
**Fix:** Update Cloudflare Workers CORS config:
```typescript
app.use('/*', cors({
  origin: ['https://oceanfresh.vercel.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowCredentials: true,
}));
```

### Issue: Supabase connection failed
**Fix:** Check environment variables:
```bash
# In Vercel Dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=correct-key-here
```

### Issue: Mobile app can't connect
**Fix:** Update base URL:
```typescript
// apps/customer-mobile/services/api.ts
const BASE_URL = 'https://oceanfresh-api.yourusername.workers.dev';
```

### Issue: Build fails on Vercel
**Fix:** Check build logs, common issues:
- Missing dependencies: Add to `package.json`
- TypeScript errors: Set `ignoreBuildErrors: true` in `next.config.ts`
- Environment variables missing: Add in Vercel Dashboard

---

## 📈 SCALING PATH (When you outgrow free tier)

### Stage 1: ₹0/month (Current)
- Vercel Hobby + Cloudflare Workers + Supabase Free

### Stage 2: ₹500/month (1,000 users)
- Vercel Pro: ₹2,000/month (or stay on Hobby)
- Cloudflare Workers Paid: ₹500/month (10M requests)
- Supabase Pro: ₹2,500/month (8GB DB)

### Stage 3: ₹2,000/month (10,000 users)
- Vercel Pro: ₹2,000/month
- Cloudflare Workers: ₹500/month
- Supabase Pro: ₹2,500/month
- **Total:** ~₹5,000/month

---

## 📚 LEARNING RESOURCES

### Supabase
- Docs: https://supabase.com/docs
- MySQL → PostgreSQL: https://supabase.com/docs/guides/database/migrating-from-mysql

### Cloudflare Workers
- Docs: https://developers.cloudflare.com/workers/
- Hono Framework: https://hono.dev/

### Vercel
- Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

### Expo Mobile
- Docs: https://docs.expo.dev/
- EAS Build: https://docs.expo.dev/build/introduction/

---

## ✅ ADVANTAGES OF THIS STACK

1. **Completely Free:** ₹0/month for development and testing
2. **Production-Ready:** All services are enterprise-grade
3. **Auto-Scaling:** Handles traffic spikes automatically
4. **Global CDN:** Fast worldwide (Vercel + Cloudflare)
5. **No Server Management:** Fully managed services
6. **Modern Stack:** TypeScript, Next.js, PostgreSQL
7. **Easy Migration:** From current XAMPP setup
8. **Built-in Security:** SSL, JWT, Row Level Security
9. **Real-time Ready:** Supabase subscriptions for live updates
10. **Mobile-First:** Expo works seamlessly with this stack

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | Database migration | 2-4 hours |
| 2 | Backend API conversion | 8-12 hours |
| 3 | Frontend deployment | 2-3 hours |
| 4 | File storage setup | 1-2 hours |
| 5 | Authentication | 3-4 hours |
| 6 | Mobile app config | 2-3 hours |
| 7 | Testing & fixes | 4-6 hours |
| **TOTAL** | | **22-34 hours** |

**Can be completed in 3-5 days of focused work!**

---

## 🎯 NEXT STEPS

1. **Create Supabase account** (5 minutes)
2. **Create Cloudflare account** (5 minutes)
3. **Create Vercel account** (5 minutes)
4. **Start with Phase 1** (Database migration)
5. **Follow this guide step-by-step**
6. **Test thoroughly before going live**

---

**This stack will run your entire OceanFresh marketplace at ₹0/month while you're building and testing!** 🚀

**Need help with any specific phase? Let me know!**
