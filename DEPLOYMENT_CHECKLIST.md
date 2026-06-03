# 🚀 OceanExotic Deployment Quick Checklist

**Use this checklist to track your deployment progress**

---

## Phase 1: Oracle Cloud Setup ✅

- [ ] Create Oracle Cloud account
- [ ] Create Compute Instance (4 OCPU, 24GB RAM recommended)
- [ ] Generate and upload SSH keys
- [ ] Note Public IP address
- [ ] Configure Security Lists (ports 22, 80, 443, 3000)
- [ ] SSH into instance successfully

---

## Phase 2: Server Environment ✅

- [ ] Update system packages (`apt update && apt upgrade`)
- [ ] Install Node.js 20.x LTS
- [ ] Install pnpm globally
- [ ] Install PHP 8.2 + extensions
- [ ] Install Composer
- [ ] Install Apache web server
- [ ] Install MySQL 8.0
- [ ] Configure MySQL to use port 3307
- [ ] Create database `ocean_fresh`
- [ ] Create database user `oceanexotic`
- [ ] Grant permissions to user

---

## Phase 3: Code Deployment ✅

- [ ] Clone Git repository to `/var/www/oceanexotic`
- [ ] Import database schemas:
  - [ ] master_induction.sql
  - [ ] user_registry.sql
  - [ ] live_marketplace_migration.sql
  - [ ] fleet_schema.sql (if exists)
- [ ] Verify database tables created
- [ ] Update `config.php` with production credentials
- [ ] Set file permissions (`chown www-data:www-data`)
- [ ] Install Node.js dependencies (`pnpm install`)

---

## Phase 4: PHP Backend ✅

- [ ] Configure PHP settings (upload size, memory limit)
- [ ] Create Apache virtual host for port 8081
- [ ] Enable Apache modules (rewrite, proxy, headers)
- [ ] Test PHP API endpoint
- [ ] Verify database connection from PHP
- [ ] Set up error logging

---

## Phase 5: Next.js Frontend ✅

- [ ] Create `.env.local` with production variables
- [ ] Update `next.config.ts` for production
- [ ] Update `src/config/api.ts` with production URLs
- [ ] Build Next.js app (`pnpm build`)
- [ ] Create systemd service for Next.js
- [ ] Enable and start systemd service
- [ ] Verify Next.js running on port 3000

---

## Phase 6: Apache Configuration ✅

- [ ] Create Apache virtual host for frontend (port 80)
- [ ] Configure reverse proxy to Next.js (port 3000)
- [ ] Enable virtual hosts
- [ ] Test Apache configuration
- [ ] Restart Apache
- [ ] Access site via IP address

---

## Phase 7: Domain & SSL ✅

- [ ] Point domain DNS to Oracle IP
- [ ] Wait for DNS propagation (1-48 hours)
- [ ] Install Certbot
- [ ] Obtain SSL certificate
- [ ] Enable HTTPS redirect
- [ ] Test SSL certificate
- [ ] Set up auto-renewal

---

## Phase 8: Mobile App Build ✅

- [ ] Update mobile app `.env` with production API URL
- [ ] Update `mobile/app.json` with production config
- [ ] Create Expo account
- [ ] Install EAS CLI (`npm install -g eas-cli`)
- [ ] Login to Expo (`eas login`)
- [ ] Configure EAS Build (`eas build:configure`)
- [ ] Build APK for testing (`eas build --platform android --profile preview`)
- [ ] Download and test APK on device
- [ ] Build for production (`eas build --platform android --profile production`)

---

## Phase 9: Testing ✅

- [ ] Test homepage loads
- [ ] Test product listing
- [ ] Test product detail page
- [ ] Test user registration
- [ ] Test user login
- [ ] Test cart functionality
- [ ] Test checkout flow
- [ ] Test admin panel access
- [ ] Test API endpoints directly
- [ ] Test mobile app connectivity
- [ ] Test on different browsers
- [ ] Test on mobile devices

---

## Phase 10: Production Hardening ✅

- [ ] Disable PHP display_errors
- [ ] Enable error logging
- [ ] Set up database backup cron job
- [ ] Configure firewall (UFW)
- [ ] Secure SSH (disable root login, password auth)
- [ ] Enable PHP OPcache
- [ ] Enable Apache compression
- [ ] Optimize MySQL settings
- [ ] Set up monitoring (UptimeRobot or similar)
- [ ] Test backup restoration

---

## Phase 11: Go Live 🎉

- [ ] Complete all previous phases
- [ ] Final end-to-end testing
- [ ] Announce launch
- [ ] Monitor logs for errors
- [ ] Set up analytics
- [ ] Create user documentation
- [ ] Plan marketing campaign

---

## Phase 12: Post-Launch (Optional) ✅

- [ ] Publish to Google Play Store
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Implement automated testing
- [ ] Set up performance monitoring
- [ ] Create disaster recovery plan
- [ ] Document maintenance procedures

---

## Quick Commands Reference

```bash
# SSH to server
ssh -i ~/.ssh/oracle_cloud ubuntu@<PUBLIC_IP>

# Check services status
sudo systemctl status oceanexotic-nextjs apache2 mysql

# View logs
sudo journalctl -u oceanexotic-nextjs -f
sudo tail -f /var/log/apache2/oceanexotic-frontend-error.log

# Deploy updates
cd /var/www/oceanexotic
git pull origin main
pnpm install
pnpm build
sudo systemctl restart oceanexotic-nextjs

# Database backup
mysqldump -u oceanexotic -p ocean_fresh | gzip > backup_$(date +%Y%m%d).sql.gz

# Database restore
gunzip < backup_20260524.sql.gz | mysql -u oceanexotic -p ocean_fresh
```

---

## Important URLs

| Service | URL | Status |
|---------|-----|--------|
| Web App | https://oceanexotic.com | ⏳ Pending |
| API | https://oceanexotic.com/api | ⏳ Pending |
| Admin Panel | https://oceanexotic.com/admin | ⏳ Pending |
| PHP API (Internal) | http://127.0.0.1:8081 | ⏳ Pending |
| Oracle Console | https://cloud.oracle.com | ✅ Ready |
| Expo Dashboard | https://expo.dev | ✅ Ready |
| Google Play Console | https://play.google.com/console | ⏳ Pending |

---

## Troubleshooting Quick Fixes

**Next.js not starting:**
```bash
sudo journalctl -u oceanexotic-nextjs -n 50
cd /var/www/oceanexotic && rm -rf .next && pnpm build
sudo systemctl restart oceanexotic-nextjs
```

**PHP API errors:**
```bash
sudo tail -f /var/log/apache2/oceanexotic-api-error.log
sudo tail -f /var/log/php_errors.log
php -r "require 'db.php'; echo 'OK';"
```

**Database connection issues:**
```bash
sudo systemctl status mysql
mysql -u oceanexotic -p -h 127.0.0.1 -P 3307 ocean_fresh
```

---

## Estimated Timeline

| Phase | Estimated Time |
|-------|---------------|
| Oracle Cloud Setup | 30 minutes |
| Server Environment | 45 minutes |
| Code Deployment | 30 minutes |
| PHP Backend | 30 minutes |
| Next.js Frontend | 45 minutes |
| Apache Configuration | 30 minutes |
| Domain & SSL | 1-48 hours (DNS propagation) |
| Mobile App Build | 30-60 minutes |
| Testing | 2-4 hours |
| Production Hardening | 1 hour |
| **Total** | **8-56 hours** (mostly waiting for DNS) |

---

## Need Help?

- **Guide:** See `DEPLOYMENT_GUIDE.md` for detailed instructions
- **Oracle Docs:** https://docs.oracle.com/en-us/iaas/
- **Next.js Docs:** https://nextjs.org/docs
- **Expo Docs:** https://docs.expo.dev
- **Stack Overflow:** https://stackoverflow.com

---

**Created:** May 24, 2026  
**Project:** OceanExotic Seafood Marketplace
