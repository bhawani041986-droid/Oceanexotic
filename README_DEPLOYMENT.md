# 🚀 OceanExotic Deployment - Master Index

**Complete deployment documentation for OceanExotic Seafood Marketplace**

---

## 📚 Available Guides

### 1. **Main Deployment Guide** 📖
**File:** [`DEPLOYMENT_GUIDE.md`](DEPLOYMENT_GUIDE.md)  
**Purpose:** Complete step-by-step deployment to Oracle Cloud  
**Length:** 1,555 lines  
**Time to Complete:** 8-56 hours

**Covers:**
- Oracle Cloud Infrastructure setup
- Server environment configuration (Node.js, PHP, MySQL, Apache)
- Database migration
- PHP backend deployment
- Next.js frontend deployment
- Android app creation
- Domain & SSL setup
- Production hardening
- Monitoring & maintenance

**Best for:** First-time deployment, complete setup

---

### 2. **Deployment Checklist** ✅
**File:** [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)  
**Purpose:** Track deployment progress  
**Length:** 262 lines  

**Features:**
- Phase-by-phase checkboxes
- Quick commands reference
- Troubleshooting quick fixes
- Estimated timeline
- Important URLs tracker

**Best for:** Following along with deployment, tracking progress

---

### 3. **Mobile App Build Guide** 📱
**File:** [`MOBILE_APP_BUILD_GUIDE.md`](MOBILE_APP_BUILD_GUIDE.md)  
**Purpose:** Build and publish Android app  
**Length:** 954 lines  
**Time to Complete:** 2-6 hours

**Covers:**
- Prerequisites and setup
- Development testing with Expo Go
- Production configuration
- Building APK (for testing)
- Building AAB (for Google Play)
- Publishing to Google Play Store
- OTA updates
- Troubleshooting

**Best for:** Mobile app development and publishing

---

## 🎯 Quick Start Paths

### Path A: Deploy Everything (Recommended for New Setup)

```
1. Read DEPLOYMENT_GUIDE.md (overview)
2. Follow DEPLOYMENT_CHECKLIST.md step-by-step
3. Reference DEPLOYMENT_GUIDE.md for detailed instructions
4. Use MOBILE_APP_BUILD_GUIDE.md for Android app
5. Complete all checklist items
6. Go live! 🎉
```

**Estimated Time:** 2-3 days (including DNS propagation)

---

### Path B: Already Have Server, Need Mobile App

```
1. Skip to MOBILE_APP_BUILD_GUIDE.md
2. Configure production URLs
3. Build APK for testing
4. Build AAB for Google Play
5. Submit to Play Store
```

**Estimated Time:** 4-8 hours

---

### Path C: Just Need Web Deployment

```
1. Read DEPLOYMENT_GUIDE.md sections 1-6
2. Follow DEPLOYMENT_CHECKLIST.md phases 1-6
3. Skip mobile app sections
4. Deploy and test web app
```

**Estimated Time:** 4-8 hours

---

## 📊 Project Architecture

```
┌─────────────────────────────────────────────────┐
│              Oracle Cloud VM                    │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Apache Web Server (Port 80/443)        │   │
│  │  ├─ Frontend: Reverse Proxy → :3000    │   │
│  │  └─ Backend: PHP API on :8081          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Next.js 15 (Port 3000)                 │   │
│  │  ├─ Customer Frontend                   │   │
│  │  ├─ Admin Dashboard                     │   │
│  │  └─ API Routes (proxy to PHP)          │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  PHP 8.2 Backend (Port 8081)            │   │
│  │  ├─ RESTful API Endpoints               │   │
│  │  ├─ Product Management                  │   │
│  │  ├─ Order Processing                    │   │
│  │  └─ User Management                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  MySQL 8.0 (Port 3307)                  │   │
│  │  ├─ ocean_fresh database                │   │
│  │  ├─ Products, Orders, Users             │   │
│  │  └─ Live Inventory Data                 │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
              ↕ HTTPS ↕
┌─────────────────────────────────────────────────┐
│           User Devices                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Web Browser│  │ Web Browser│  │ Android   │ │
│  │ (Desktop)  │  │ (Mobile)   │  │ App       │ │
│  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Web Application

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend Framework** | Next.js | 15.0.3 |
| **Language** | TypeScript | 5.x |
| **UI Library** | React | 19.0.0 |
| **Styling** | TailwindCSS | 4.x |
| **State Management** | Zustand | 5.0.1 |
| **Icons** | Lucide React | 0.454.0 |
| **Animations** | Framer Motion | 12.40.0 |

### Backend API

| Component | Technology | Version |
|-----------|-----------|---------|
| **Server** | Apache | 2.4.x |
| **Language** | PHP | 8.2+ |
| **Database** | MySQL | 8.0 |
| **DB Interface** | PDO | Built-in |
| **Package Manager** | Composer | 2.x |

### Mobile App

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | React Native (Expo) | SDK 54 |
| **Language** | TypeScript | 5.9.2 |
| **Navigation** | Expo Router | 6.0.23 |
| **Styling** | NativeWind | 4.0.36 |
| **State Management** | Zustand | 5.0.13 |
| **HTTP Client** | Axios | 1.16.1 |

### Infrastructure

| Component | Technology | Version |
|-----------|-----------|---------|
| **Cloud Provider** | Oracle Cloud Infrastructure | - |
| **OS** | Ubuntu | 22.04 LTS |
| **Reverse Proxy** | Apache | 2.4.x |
| **SSL** | Let's Encrypt (Certbot) | Latest |
| **Process Manager** | Systemd | Built-in |

---

## 📁 Project Structure

```
FISH_MARKET/
├── 📖 Documentation
│   ├── README_DEPLOYMENT.md          ← You are here
│   ├── DEPLOYMENT_GUIDE.md           ← Main deployment guide
│   ├── DEPLOYMENT_CHECKLIST.md       ← Progress tracker
│   ├── MOBILE_APP_BUILD_GUIDE.md     ← Android app guide
│   └── blueprints/
│       └── PRODUCT_MODERATION_SYSTEM_BLUEPRINT.md
│
├── 🌐 Web Frontend (Next.js)
│   ├── src/
│   │   ├── app/                      ← Pages (App Router)
│   │   ├── components/               ← Reusable components
│   │   ├── config/                   ← Configuration
│   │   ├── store/                    ← Zustand stores
│   │   └── lib/                      ← Utilities
│   ├── public/                       ← Static assets
│   ├── next.config.ts                ← Next.js config
│   ├── package.json                  ← Dependencies
│   └── tsconfig.json                 ← TypeScript config
│
├── 🔌 Backend API (PHP)
│   ├── api/
│   │   ├── products/                 ← Product endpoints
│   │   ├── orders/                   ← Order endpoints
│   │   ├── user/                     ← User endpoints
│   │   ├── marketplace/              ← Checkout endpoint
│   │   └── admin/                    ← Admin endpoints
│   ├── database/
│   │   ├── query_bridge.php          ← DB bridge for Next.js
│   │   └── *.sql                     ← Schema files
│   ├── config.php                    ← PHP configuration
│   └── db.php                        ← Database connection
│
├── 📱 Mobile App (Expo)
│   ├── mobile/
│   │   ├── app/                      ← Pages (Expo Router)
│   │   ├── src/                      ← Source code
│   │   ├── assets/                   ← Images, fonts
│   │   ├── app.json                  ← App configuration
│   │   ├── eas.json                  ← EAS Build config
│   │   └── package.json              ← Dependencies
│
└── 🔧 Configuration
    ├── .gitignore                    ← Git ignore rules
    ├── vercel.json                   ← Vercel config (optional)
    └── .env*                         ← Environment variables
```

---

## 🚀 Deployment Overview

### Step 1: Oracle Cloud Setup (30 min)
- Create account
- Provision VM (4 OCPU, 24GB RAM)
- Configure firewall
- SSH access

### Step 2: Server Environment (45 min)
- Install Node.js, PHP, MySQL, Apache
- Configure services
- Create database

### Step 3: Code Deployment (30 min)
- Clone from Git
- Import database
- Install dependencies
- Configure environment

### Step 4: Backend Setup (30 min)
- Configure PHP API
- Set up Apache virtual host
- Test endpoints

### Step 5: Frontend Setup (45 min)
- Build Next.js
- Configure systemd service
- Set up reverse proxy

### Step 6: Domain & SSL (1-48 hours)
- Point DNS
- Install SSL certificate
- Enable HTTPS

### Step 7: Mobile App (2-4 hours)
- Configure production URLs
- Build APK for testing
- Build AAB for Play Store
- Submit to Google Play

### Step 8: Testing & Launch (2-4 hours)
- End-to-end testing
- Performance optimization
- Go live!

---

## 💰 Cost Breakdown

### Oracle Cloud (Free Tier)

| Resource | Allocation | Usage | Cost |
|----------|-----------|-------|------|
| Compute VM (ARM) | 4 OCPU, 24GB | ~30% | $0 |
| Block Storage | 200 GB | ~50 GB | $0 |
| Data Transfer | 10 TB/month | ~500 GB | $0 |
| **Total** | | | **$0/month** |

### Other Services

| Service | Cost | Frequency |
|---------|------|-----------|
| Domain Name | $10-15 | Per year |
| SSL Certificate | $0 | Free (Let's Encrypt) |
| Expo Account | $0 | Free |
| EAS Build | $0 | Free tier (30 builds/mo) |
| Google Play Developer | $25 | One-time |
| **Total First Year** | **$35-40** | |

---

## 📋 Pre-Deployment Checklist

- [ ] Git repository updated and pushed
- [ ] Database schemas ready
- [ ] Domain purchased
- [ ] Oracle Cloud account created
- [ ] Expo account created
- [ ] Google Play Developer account (if publishing app)
- [ ] SSL email accessible (for Let's Encrypt)
- [ ] SSH keys generated
- [ ] Backups strategy planned
- [ ] Monitoring plan ready

---

## 🔐 Security Checklist

- [ ] Strong database passwords
- [ ] SSH key authentication only
- [ ] Firewall configured
- [ ] SSL/TLS enabled
- [ ] File permissions set
- [ ] Error display disabled (production)
- [ ] Regular backups scheduled
- [ ] Security headers configured
- [ ] CORS policies set
- [ ] Input validation enabled

---

## 📊 Post-Deployment Monitoring

### What to Monitor

1. **Uptime**
   - Use UptimeRobot or similar
   - Check every 5 minutes
   - Alert on downtime

2. **Performance**
   - Page load times
   - API response times
   - Database query times

3. **Errors**
   - Application logs
   - Server logs
   - Database logs

4. **Resources**
   - CPU usage
   - Memory usage
   - Disk space
   - Bandwidth

### Tools

- **Uptime:** UptimeRobot, Pingdom
- **Logs:** Journalctl, Apache logs
- **Performance:** New Relic (free tier), Datadog
- **Resources:** htop, df, CloudWatch

---

## 🆘 Support & Resources

### Documentation

- **This Guide:** Start here
- **Next.js Docs:** https://nextjs.org/docs
- **Expo Docs:** https://docs.expo.dev
- **Oracle Cloud Docs:** https://docs.oracle.com/en-us/iaas/
- **PHP Docs:** https://www.php.net/docs.php
- **MySQL Docs:** https://dev.mysql.com/doc/

### Communities

- **Stack Overflow:** https://stackoverflow.com
- **Expo Forums:** https://forums.expo.dev
- **Oracle Community:** https://community.oracle.com
- **GitHub Issues:** Your repository

### Professional Support

- **Oracle Support:** Included with paid tiers
- **Expo Priority Support:** $29/month
- **Freelance Developers:** Upwork, Fiverr

---

## 📞 Quick Help Commands

```bash
# Check if services are running
sudo systemctl status oceanexotic-nextjs apache2 mysql

# View recent errors
sudo journalctl -u oceanexotic-nextjs --since "1 hour ago"
sudo tail -n 100 /var/log/apache2/oceanexotic-frontend-error.log

# Restart everything
sudo systemctl restart oceanexotic-nextjs apache2 mysql

# Check disk space
df -h

# Check memory
free -h

# Database backup
mysqldump -u oceanexotic -p ocean_fresh | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# Deploy latest code
cd /var/www/oceanexotic && git pull && pnpm install && pnpm build && sudo systemctl restart oceanexotic-nextjs
```

---

## 🎓 Learning Path

### For Beginners

1. Read through all guides first
2. Set up local development environment
3. Test locally before deploying
4. Deploy to Oracle Cloud following checklist
5. Build and test mobile app
6. Go live!

### For Experienced Developers

1. Skim guides for project-specific configuration
2. Focus on sections 3-6 in main guide
3. Use checklist for tracking
4. Customize configurations as needed
5. Deploy and optimize

---

## 🔄 Update Workflow

### Updating Web Application

```bash
# 1. Push code to Git
git add .
git commit -m "Update description"
git push origin main

# 2. SSH to server
ssh -i ~/.ssh/oracle_cloud ubuntu@<IP>

# 3. Deploy
cd /var/www/oceanexotic
git pull origin main
pnpm install
pnpm build
sudo systemctl restart oceanexotic-nextjs

# 4. Verify
curl https://oceanexotic.com
```

### Updating Mobile App

```bash
# For JavaScript changes (OTA)
cd mobile
eas update --branch production --message "Bug fix"

# For native changes (requires rebuild)
cd mobile
eas build --platform android --profile production
eas submit --platform android
```

---

## 📈 Scaling Considerations

### When to Scale

- CPU consistently > 70%
- Memory consistently > 80%
- Database slow queries
- User complaints about speed
- Traffic growth

### Scaling Options

1. **Vertical Scaling** (Easiest)
   - Increase VM size
   - More CPU/RAM
   - No code changes needed

2. **Database Optimization**
   - Add indexes
   - Query optimization
   - Connection pooling

3. **Caching**
   - Redis for sessions
   - CDN for assets
   - API response caching

4. **Horizontal Scaling** (Advanced)
   - Load balancer
   - Multiple app servers
   - Database replication

---

## 🎉 Success Metrics

### Technical Metrics

- [ ] Uptime > 99.9%
- [ ] Page load < 2 seconds
- [ ] API response < 500ms
- [ ] Zero critical errors
- [ ] Automated backups working

### Business Metrics

- [ ] Users can register/login
- [ ] Products display correctly
- [ ] Checkout completes successfully
- [ ] Orders appear in admin
- [ ] Mobile app functional
- [ ] Customer satisfaction high

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | May 24, 2026 | Initial documentation |

---

## 🙏 Acknowledgments

This documentation was created to support the successful deployment of OceanExotic Seafood Marketplace to Oracle Cloud Infrastructure.

---

**Last Updated:** May 24, 2026  
**Maintained By:** Development Team  
**Project:** OceanExotic Global  
**Version:** 1.0

---

*Ready to deploy? Start with the [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)! 🚀*
