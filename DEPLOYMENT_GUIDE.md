# 🚀 OceanExotic Complete Deployment Guide

**Project:** OceanExotic Seafood Marketplace  
**Stack:** Next.js 15 + PHP/MySQL + React Native (Expo)  
**Target:** Oracle Cloud Infrastructure (OCI) + Android APK  
**Guide Version:** 1.0  
**Last Updated:** May 24, 2026

---

## 📋 Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Oracle Cloud Infrastructure Setup](#2-oracle-cloud-infrastructure-setup)
3. [Server Environment Configuration](#3-server-environment-configuration)
4. [Database Migration](#4-database-migration)
5. [PHP Backend Deployment](#5-php-backend-deployment)
6. [Next.js Frontend Deployment](#6-nextjs-frontend-deployment)
7. [Android App Creation](#7-android-app-creation)
8. [Production Configuration](#8-production-configuration)
9. [Domain & SSL Setup](#9-domain--ssl-setup)
10. [Monitoring & Maintenance](#10-monitoring--maintenance)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Project Architecture Overview

### Current Structure:

```
FISH_MARKET/
├── src/                      # Next.js 15 Frontend (React/TypeScript)
│   ├── app/                  # App Router pages
│   ├── components/           # UI components
│   ├── config/               # Configuration files
│   └── store/                # Zustand state management
├── api/                      # PHP Backend (RESTful API)
│   ├── products/             # Product CRUD endpoints
│   ├── orders/               # Order management
│   ├── user/                 # User management
│   └── marketplace/          # Checkout & marketplace
├── database/                 # SQL schemas & migrations
│   ├── master_induction.sql  # Base schema
│   └── query_bridge.php      # Database bridge for Next.js
├── mobile/                   # React Native Mobile App (Expo)
│   ├── app/                  # Expo Router pages
│   └── src/                  # Mobile-specific code
├── config.php                # PHP configuration
├── db.php                    # Database connection
├── next.config.ts            # Next.js configuration
└── package.json              # Node.js dependencies
```

### Deployment Components:

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **Web Frontend** | Next.js 15 | 3000 | Customer/Admin web interface |
| **PHP API** | PHP 8.x + Apache | 8081 | RESTful API endpoints |
| **Database** | MySQL | 3307 | Data storage |
| **Mobile App** | React Native (Expo) | - | Android/iOS app |

---

## 2. Oracle Cloud Infrastructure Setup

### 2.1 Create Oracle Cloud Account

**Steps:**

1. Go to https://cloud.oracle.com
2. Click "Start Free" or "Sign In"
3. Choose deployment region (closest to your users)
4. Complete account setup with payment verification

**Free Tier Includes:**
- 2 AMD Compute VMs (1/8 OCPU each)
- 4 ARM Ampere VMs (up to 24 GB total)
- 200 GB Block Storage
- 10 TB/month Outbound Data Transfer

---

### 2.2 Create Compute Instance

**Recommended Configuration:**

```
Instance Type: VM.Standard.A1.Flex (ARM)
OCPU: 4 OCPU
Memory: 24 GB
OS: Ubuntu 22.04 or Oracle Linux 8
Boot Volume: 100 GB (minimum)
```

**SSH Key Setup:**
1. Generate SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/oracle_cloud
   ```
2. Upload public key during instance creation
3. Save private key securely

**Instance Creation Steps:**

```bash
# After instance is created, note:
- Public IP Address
- Private IP Address
- SSH Key location

# Connect to your instance:
ssh -i ~/.ssh/oracle_cloud ubuntu@<PUBLIC_IP>
```

---

### 2.3 Configure Security Lists (Firewall)

**Inbound Rules Needed:**

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| 22 | TCP | 0.0.0.0/0 | SSH Access |
| 80 | TCP | 0.0.0.0/0 | HTTP |
| 443 | TCP | 0.0.0.0/0 | HTTPS |
| 3000 | TCP | 0.0.0.0/0 | Next.js (temporary) |
| 8081 | TCP | 127.0.0.1 | PHP API (internal only) |
| 3307 | TCP | 127.0.0.1 | MySQL (internal only) |

**Oracle Cloud Console Steps:**
1. Go to Networking → Virtual Cloud Networks
2. Click your VCN
3. Click Security Lists
4. Add Ingress Rules for ports above

---

### 2.4 Configure OS Firewall

```bash
# SSH into your instance
ssh -i ~/.ssh/oracle_cloud ubuntu@<PUBLIC_IP>

# For Ubuntu (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw enable

# For Oracle Linux (firewalld)
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

## 3. Server Environment Configuration

### 3.1 Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y git curl wget unzip htop nano
```

---

### 3.2 Install Node.js 20.x (LTS)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version    # Should show v20.x.x
npm --version     # Should show 10.x.x

# Install pnpm (recommended package manager)
sudo npm install -g pnpm
pnpm --version
```

---

### 3.3 Install PHP 8.2+

```bash
# Add PHP repository
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-curl \
  php8.2-mbstring php8.2-xml php8.2-zip php8.2-gd php8.2-bcmath

# Verify installation
php --version

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
composer --version
```

---

### 3.4 Install Apache Web Server

```bash
# Install Apache
sudo apt install -y apache2

# Enable required modules
sudo a2enmod rewrite proxy proxy_http proxy_fcgi headers ssl

# Start and enable Apache
sudo systemctl start apache2
sudo systemctl enable apache2

# Verify Apache is running
sudo systemctl status apache2
```

---

### 3.5 Install MySQL 8.0

```bash
# Install MySQL
sudo apt install -y mysql-server

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

**MySQL Secure Installation Prompts:**
```
Enter current password for root: (press Enter - no password)
Switch to unix_socket authentication? n
Change the root password? y
New password: <YOUR_SECURE_PASSWORD>
Re-enter new password: <YOUR_SECURE_PASSWORD>
Remove anonymous users? y
Disallow root login remotely? y
Remove test database? y
Reload privilege tables now? y
```

**Configure MySQL Port to 3307:**

```bash
# Edit MySQL configuration
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Find or add this line under [mysqld]:
port = 3307

# Restart MySQL
sudo systemctl restart mysql

# Verify port change
sudo netstat -tlnp | grep 3307
```

---

### 3.6 Create Database and User

```bash
# Login to MySQL
sudo mysql -u root -p

# Inside MySQL shell:
CREATE DATABASE ocean_fresh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'oceanexotic'@'localhost' IDENTIFIED BY '<STRONG_PASSWORD>';

GRANT ALL PRIVILEGES ON ocean_fresh.* TO 'oceanexotic'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

---

## 4. Database Migration

### 4.1 Clone Repository to Server

```bash
# Create application directory
sudo mkdir -p /var/www/oceanexotic
sudo chown $USER:$USER /var/www/oceanexotic

# Clone from Git
cd /var/www/oceanexotic
git clone https://github.com/YOUR_USERNAME/FISH_MARKET.git .
git pull origin main  # Ensure latest
```

---

### 4.2 Import Database Schema

```bash
# Navigate to database directory
cd /var/www/oceanexotic/database

# Import base schema
mysql -u oceanexotic -p ocean_fresh < master_induction.sql

# Import user registry
mysql -u oceanexotic -p ocean_fresh < user_registry.sql

# Import live marketplace migration
mysql -u oceanexotic -p ocean_fresh < live_marketplace_migration.sql

# Import fleet schema (if exists)
mysql -u oceanexotic -p ocean_fresh < fleet_schema.sql

# Verify tables
mysql -u oceanexotic -p -e "USE ocean_fresh; SHOW TABLES;"
```

---

### 4.3 Seed Initial Data (Optional)

```bash
# If you have seed data SQL files
mysql -u oceanexotic -p ocean_fresh < seed_data.sql

# Or run PHP migration scripts
cd /var/www/oceanexotic
php database/migrate_overhaul.php
```

---

## 5. PHP Backend Deployment

### 5.1 Configure PHP Settings

```bash
# Edit php.ini
sudo nano /etc/php/8.2/apache2/php.ini

# Update these values:
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
memory_limit = 256M
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
```

---

### 5.2 Update Production Configuration

```bash
# Edit config.php
cd /var/www/oceanexotic
nano config.php
```

**Production config.php:**

```php
<?php
// OceanExotic Global Configuration
// PRODUCTION ENVIRONMENT

define('SITE_URL', 'https://oceanexotic.com');  // Update with your domain
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'ocean_fresh');
define('DB_USER', 'oceanexotic');               // Use created user
define('DB_PASS', '<YOUR_DB_PASSWORD>');        // Use strong password

// Environment Settings
error_reporting(E_ALL);
ini_set('display_errors', 0);                   // Disable in production
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php_errors.log');

// App Constants
define('APP_NAME', 'OceanExotic');
define('APP_VERSION', '1.0.0');
?>
```

---

### 5.3 Configure Apache for PHP API

```bash
# Create Apache virtual host for PHP API
sudo nano /etc/apache2/sites-available/oceanexotic-api.conf
```

**Apache Virtual Host Configuration:**

```apache
<VirtualHost *:8081>
    ServerAdmin admin@oceanexotic.com
    DocumentRoot /var/www/oceanexotic
    
    <Directory /var/www/oceanexotic>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Error Logs
    ErrorLog ${APACHE_LOG_DIR}/oceanexotic-api-error.log
    CustomLog ${APACHE_LOG_DIR}/oceanexotic-api-access.log combined
</VirtualHost>
```

**Enable the site:**

```bash
# Add port 8081 to Apache ports.conf
sudo nano /etc/apache2/ports.conf

# Add this line:
Listen 8081

# Enable the site
sudo a2ensite oceanexotic-api.conf

# Restart Apache
sudo systemctl restart apache2

# Test PHP API
curl http://127.0.0.1:8081/FISH_MARKET/api/products/list.php
```

---

### 5.4 Set File Permissions

```bash
# Set ownership
sudo chown -R www-data:www-data /var/www/oceanexotic

# Set permissions
sudo find /var/www/oceanexotic -type d -exec chmod 755 {} \;
sudo find /var/www/oceanexotic -type f -exec chmod 644 {} \;

# Make specific directories writable
sudo chown -R www-data:www-data /var/www/oceanexotic/public/uploads
sudo chmod -R 775 /var/www/oceanexotic/public/uploads
```

---

## 6. Next.js Frontend Deployment

### 6.1 Install Dependencies

```bash
cd /var/www/oceanexotic

# Install Node.js dependencies
pnpm install

# Or if using npm:
# npm install
```

---

### 6.2 Configure Environment Variables

```bash
# Create .env.local
nano .env.local
```

**Production .env.local:**

```env
# Next.js Environment Variables
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://oceanexotic.com
NEXT_PUBLIC_API_URL=https://oceanexotic.com/api
NEXT_PUBLIC_PHP_SERVER_URL=http://127.0.0.1:8081

# Optional: Analytics
# NEXT_PUBLIC_ANALYTICS_ID=your_id
```

---

### 6.3 Build Next.js Application

```bash
# Build for production
pnpm build

# Or: npm run build

# Verify build output
ls -la .next/
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (25/25)
✓ Collecting build traces
✓ Finalizing page optimization
```

---

### 6.4 Configure Apache for Next.js

```bash
# Create Apache virtual host for Next.js
sudo nano /etc/apache2/sites-available/oceanexotic-frontend.conf
```

**Apache Reverse Proxy Configuration:**

```apache
<VirtualHost *:80>
    ServerName oceanexotic.com
    ServerAdmin admin@oceanexotic.com
    
    # Proxy to Next.js
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
    
    # WebSocket support (for future real-time features)
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Error Logs
    ErrorLog ${APACHE_LOG_DIR}/oceanexotic-frontend-error.log
    CustomLog ${APACHE_LOG_DIR}/oceanexotic-frontend-access.log combined
</VirtualHost>
```

**Enable the site:**

```bash
sudo a2ensite oceanexotic-frontend.conf
sudo systemctl reload apache2
```

---

### 6.5 Create Systemd Service for Next.js

```bash
# Create service file
sudo nano /etc/systemd/system/oceanexotic-nextjs.service
```

**Service Configuration:**

```ini
[Unit]
Description=OceanExotic Next.js Application
After=network.target mysql.service apache2.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/oceanexotic
ExecStart=/usr/bin/node /var/www/oceanexotic/node_modules/.bin/next start -H 0.0.0.0 -p 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0

# Security
NoNewPrivileges=true
PrivateTmp=true

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=oceanexotic-nextjs

[Install]
WantedBy=multi-user.target
```

**Enable and start the service:**

```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable service
sudo systemctl enable oceanexotic-nextjs

# Start service
sudo systemctl start oceanexotic-nextjs

# Check status
sudo systemctl status oceanexotic-nextjs

# View logs
sudo journalctl -u oceanexotic-nextjs -f
```

---

### 6.6 Update next.config.ts for Production

**Update your next.config.ts:**

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
        hostname: 'oceanexotic.com',  // Add your domain
        pathname: '**',
      },
    ],
  },
  // Remove rewrites for production - Apache handles proxying
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://127.0.0.1:8081/FISH_MARKET/api/:path*',
  //     },
  //   ];
  // },
};

export default nextConfig;
```

---

## 7. Android App Creation

### 7.1 Prepare Mobile App Configuration

```bash
# Navigate to mobile directory
cd /var/www/oceanexotic/mobile

# Update .env for production
nano .env.production
```

**Production .env:**

```env
EXPO_PUBLIC_API_URL=https://oceanexotic.com/api
EXPO_PUBLIC_API_PORT=443
```

---

### 7.2 Update app.json for Production

```bash
nano app.json
```

**Production app.json:**

```json
{
  "expo": {
    "name": "OceanExotic",
    "slug": "oceanexotic-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "scheme": "oceanexotic",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0F172A"
    },
    "assetBundlePatterns": [
      "assets/**"
    ],
    "android": {
      "package": "com.oceanexotic.mobile",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0F172A"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      "usesCleartextTraffic": false
    },
    "ios": {
      "bundleIdentifier": "com.oceanexotic.mobile",
      "supportsTablet": true,
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false
        }
      }
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

---

### 7.3 Install Expo CLI

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo
eas login

# If you don't have an Expo account:
# Create one at: https://expo.dev/signup
```

---

### 7.4 Configure EAS Build

```bash
# Initialize EAS Build
cd /var/www/oceanexotic/mobile
eas build:configure

# This creates eas.json
```

**eas.json Configuration:**

```json
{
  "cli": {
    "version": ">= 10.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

### 7.5 Build Android APK

**Option A: Cloud Build (Recommended)**

```bash
# Build APK for testing
eas build --platform android --profile preview

# Build for production (Google Play)
eas build --platform android --profile production

# The build will happen on Expo's servers
# You'll receive a download link when complete
```

**Option B: Local Build**

```bash
# Install Android SDK (if building locally)
# This is complex - cloud build is recommended

# Build locally
eas build --platform android --local --profile preview
```

**Expected Build Time:** 10-20 minutes

**Download APK:**
- Link provided in terminal after build completes
- Also available at: https://expo.dev/accounts/YOUR_ACCOUNT/projects/oceanexotic-mobile/builds

---

### 7.6 Test APK on Device

```bash
# Transfer APK to your Android device
# Option 1: Email the APK to yourself
# Option 2: Upload to Google Drive/Dropbox
# Option 3: Use adb (Android Debug Bridge)

# Using adb:
adb install path/to/oceanexotic-mobile.apk
```

**Install on Android Device:**
1. Download APK to device
2. Enable "Install from Unknown Sources" in Settings
3. Open APK file
4. Follow installation prompts
5. Launch OceanExotic app

---

### 7.7 Publish to Google Play Store (Optional)

**Steps:**

1. **Create Google Play Developer Account:**
   - Go to: https://play.google.com/console
   - Pay $25 one-time fee
   - Complete registration

2. **Prepare Store Listing:**
   - App name: OceanExotic
   - Short description: Fresh seafood delivery
   - Full description: Detailed app description
   - Screenshots (phone, tablet)
   - App icon (512x512)
   - Feature graphic (1024x500)

3. **Upload App Bundle:**
   ```bash
   # Build production bundle
   eas build --platform android --profile production
   
   # Or submit directly
   eas submit --platform android
   ```

4. **Complete Content Rating:**
   - Answer questionnaire
   - Get age rating

5. **Set Pricing & Distribution:**
   - Free or Paid
   - Countries/Regions
   - Content guidelines compliance

6. **Submit for Review:**
   - Review takes 1-7 days
   - Address any rejections
   - Publish when approved

---

## 8. Production Configuration

### 8.1 Update API Configuration

**File:** `src/config/api.ts`

```typescript
export const API_BASE_URL = "/api";
export const FULL_API_URL = "/api";

// Production URLs
export const BRIDGE_URL = "http://127.0.0.1:8081/FISH_MARKET/database/query_bridge.php";

export function getPhpServerUrl(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    // In production, use relative path (Apache handles proxying)
    if (window.location.hostname === 'oceanexotic.com') {
      return "http://127.0.0.1:8081";
    }
    return `http://${window.location.hostname}:8081`;
  }
  return "http://127.0.0.1:8081";
}

export const PHP_SERVER_URL = getPhpServerUrl();
```

---

### 8.2 Configure Mobile App API URLs

**Update mobile/src/services/api.ts or similar:**

```typescript
import Constants from 'expo-constants';

const API_URL = __DEV__
  ? 'http://192.168.0.199:8081/FISH_MARKET/api'  // Development
  : 'https://oceanexotic.com/api';                // Production

export const API_CONFIG = {
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};
```

---

### 8.3 Environment-Specific Builds

**Create environment files:**

```bash
# Development
.env.development

# Staging
.env.staging

# Production
.env.production
```

**Update package.json scripts:**

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "build": "next build",
    "build:staging": "NODE_ENV=staging next build",
    "build:production": "NODE_ENV=production next build",
    "start": "next start -H 0.0.0.0"
  }
}
```

---

## 9. Domain & SSL Setup

### 9.1 Configure Domain DNS

**Add DNS Records:**

```
Type: A
Name: @
Value: <YOUR_ORACLE_PUBLIC_IP>
TTL: 3600

Type: A
Name: www
Value: <YOUR_ORACLE_PUBLIC_IP>
TTL: 3600
```

**Wait for DNS propagation:** 1-48 hours

---

### 9.2 Install SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-apache

# Obtain SSL certificate
sudo certbot --apache -d oceanexotic.com -d www.oceanexotic.com

# Follow prompts:
# - Enter email address
# - Agree to Terms of Service
# - Choose whether to redirect HTTP to HTTPS (choose YES)
```

**Auto-Renewal Setup:**

```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Certbot automatically adds cron job
# Verify with:
sudo systemctl status certbot.timer
```

---

### 9.3 Update Apache SSL Configuration

```bash
# Certbot will create SSL config
# Verify it exists:
ls -la /etc/apache2/sites-available/oceanexotic-frontend-le-ssl.conf

# Check SSL configuration
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 10. Monitoring & Maintenance

### 10.1 Set Up Log Monitoring

```bash
# View Next.js logs
sudo journalctl -u oceanexotic-nextjs -f

# View Apache logs
sudo tail -f /var/log/apache2/oceanexotic-frontend-access.log
sudo tail -f /var/log/apache2/oceanexotic-frontend-error.log
sudo tail -f /var/log/apache2/oceanexotic-api-access.log
sudo tail -f /var/log/apache2/oceanexotic-api-error.log

# View PHP errors
sudo tail -f /var/log/php_errors.log
```

---

### 10.2 Set Up Monitoring Tools

**Option A: UptimeRobot (Free)**

1. Go to https://uptimerobot.com
2. Create account
3. Add monitor: https://oceanexotic.com
4. Check every 5 minutes
5. Get email/SMS alerts on downtime

**Option B: Install PM2 for Process Management**

```bash
# Install PM2
sudo npm install -g pm2

# Start Next.js with PM2 (alternative to systemd)
cd /var/www/oceanexotic
pm2 start npm --name "oceanexotic-nextjs" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

---

### 10.3 Database Backup Strategy

```bash
# Create backup script
sudo nano /usr/local/bin/backup-oceanexotic-db.sh
```

**Backup Script:**

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/oceanexotic"
DATE=$(date +%Y%m%d_%H%M%S)
DB_USER="oceanexotic"
DB_PASS="<YOUR_PASSWORD>"
DB_NAME="ocean_fresh"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/ocean_fresh_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/ocean_fresh_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ocean_fresh_$DATE.sql.gz"
```

**Make executable and add to cron:**

```bash
sudo chmod +x /usr/local/bin/backup-oceanexotic-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-oceanexotic-db.sh >> /var/log/oceanexotic-backup.log 2>&1
```

---

### 10.4 Update Deployment Script

**Create deployment script:**

```bash
sudo nano /usr/local/bin/deploy-oceanexotic.sh
```

**Deployment Script:**

```bash
#!/bin/bash

echo "🚀 Starting OceanExotic Deployment..."

cd /var/www/oceanexotic

# Pull latest changes
echo "📦 Pulling latest code..."
git pull origin main

# Install dependencies
echo "📚 Installing dependencies..."
pnpm install

# Build Next.js
echo "🔨 Building Next.js..."
pnpm build

# Restart services
echo "🔄 Restarting services..."
sudo systemctl restart oceanexotic-nextjs
sudo systemctl restart apache2

echo "✅ Deployment complete!"
```

**Make executable:**

```bash
sudo chmod +x /usr/local/bin/deploy-oceanexotic.sh

# Deploy with:
sudo /usr/local/bin/deploy-oceanexotic.sh
```

---

## 11. Troubleshooting

### 11.1 Common Issues

**Issue: Next.js won't start**

```bash
# Check logs
sudo journalctl -u oceanexotic-nextjs -n 50

# Common fixes:
cd /var/www/oceanexotic
rm -rf .next
pnpm install
pnpm build
sudo systemctl restart oceanexotic-nextjs
```

---

**Issue: PHP API returns 500 errors**

```bash
# Check Apache error log
sudo tail -f /var/log/apache2/oceanexotic-api-error.log

# Check PHP error log
sudo tail -f /var/log/php_errors.log

# Verify database connection
php -r "require 'db.php'; echo 'DB Connected';"

# Check file permissions
sudo chown -R www-data:www-data /var/www/oceanexotic
```

---

**Issue: Database connection failed**

```bash
# Check MySQL is running
sudo systemctl status mysql

# Check port
sudo netstat -tlnp | grep 3307

# Test connection
mysql -u oceanexotic -p -h 127.0.0.1 -P 3307 ocean_fresh

# Verify credentials in config.php
nano /var/www/oceanexotic/config.php
```

---

**Issue: APK installation fails**

```bash
# Check Android version compatibility
# Min SDK: Android 6.0 (API 23)

# Enable unknown sources
Settings > Security > Unknown Sources (enable)

# Check APK integrity
# Rebuild: eas build --platform android --profile preview

# Clear package cache
adb shell pm clear com.oceanexotic.mobile
```

---

### 11.2 Performance Optimization

**Enable PHP OPcache:**

```bash
sudo nano /etc/php/8.2/apache2/conf.d/10-opcache.ini
```

**Add:**

```ini
opcache.enable=1
opcache.memory_consumption=128
opcache.max_accelerated_files=10000
opcache.revalidate_freq=60
```

---

**Enable Apache Compression:**

```bash
sudo a2enmod deflate headers
sudo nano /etc/apache2/mods-available/deflate.conf
```

**Add:**

```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

---

**Optimize MySQL:**

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

**Add under [mysqld]:**

```ini
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200
query_cache_size = 64M
query_cache_type = 1
```

---

### 11.3 Security Hardening

**Disable directory listing:**

```apache
# In Apache virtual host
<Directory /var/www/oceanexotic>
    Options -Indexes
    AllowOverride All
    Require all granted
</Directory>
```

---

**Enable firewall:**

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

---

**Secure SSH:**

```bash
sudo nano /etc/ssh/sshd_config

# Update:
PermitRootLogin no
PasswordAuthentication no
MaxAuthTries 3

sudo systemctl restart sshd
```

---

## Quick Reference Commands

### Server Management

```bash
# Check all services
sudo systemctl status oceanexotic-nextjs apache2 mysql

# Restart all services
sudo systemctl restart oceanexotic-nextjs apache2 mysql

# View logs
sudo journalctl -u oceanexotic-nextjs -f
sudo tail -f /var/log/apache2/oceanexotic-*.log

# Check disk space
df -h

# Check memory
free -h

# Check CPU usage
htop
```

---

### Git Deployment

```bash
# Deploy from Git
cd /var/www/oceanexotic
git pull origin main
pnpm install
pnpm build
sudo systemctl restart oceanexotic-nextjs
```

---

### Database Management

```bash
# Backup database
mysqldump -u oceanexotic -p ocean_fresh > backup.sql

# Restore database
mysql -u oceanexotic -p ocean_fresh < backup.sql

# Check database size
mysql -u oceanexotic -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'ocean_fresh';"
```

---

### Mobile App

```bash
# Build Android APK
cd mobile
eas build --platform android --profile preview

# Build for production
eas build --platform android --profile production

# Update app
git push origin main
eas build --platform android --profile production
```

---

## Checklist Before Going Live

### Pre-Launch Checklist

- [ ] Server provisioned and configured
- [ ] Domain DNS pointing to server IP
- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database imported and tested
- [ ] PHP API responding correctly
- [ ] Next.js built and running
- [ ] Apache reverse proxy configured
- [ ] File permissions set correctly
- [ ] Environment variables configured
- [ ] Error logging enabled
- [ ] Database backup cron job active
- [ ] Firewall rules configured
- [ ] SSH secured
- [ ] Android APK built and tested
- [ ] Mobile app API URLs updated to production
- [ ] Monitoring/alerts configured
- [ ] Performance optimization enabled
- [ ] Security hardening completed
- [ ] Test checkout flow end-to-end
- [ ] Test user registration/login
- [ ] Test product browsing
- [ ] Test admin panel
- [ ] Test mobile app connectivity

---

## Support Resources

### Documentation

- Next.js: https://nextjs.org/docs
- Expo: https://docs.expo.dev
- Oracle Cloud: https://docs.oracle.com/en-us/iaas/Content/home.htm
- Apache: https://httpd.apache.org/docs/
- MySQL: https://dev.mysql.com/doc/

### Community

- Stack Overflow: https://stackoverflow.com/questions/tagged/next.js
- Expo Forums: https://forums.expo.dev
- Oracle Community: https://community.oracle.com

---

## Estimated Costs (Oracle Cloud Free Tier)

| Resource | Free Tier | Your Usage | Cost |
|----------|-----------|------------|------|
| Compute VM (ARM) | 4 OCPU, 24 GB | Included | $0 |
| Block Storage | 200 GB | ~50 GB | $0 |
| Data Transfer | 10 TB/month | ~500 GB | $0 |
| MySQL | Self-hosted | Included | $0 |
| **Total** | | | **$0/month** |

**If exceeding free tier:**
- Additional storage: $0.025/GB/month
- Additional bandwidth: $0.0085/GB
- Larger VM: $0.044/hour

---

## Next Steps

1. ✅ Follow this guide step-by-step
2. ✅ Test each component individually
3. ✅ Complete pre-launch checklist
4. ✅ Go live!
5. 📱 Publish Android app to Google Play
6. 📊 Set up analytics and monitoring
7. 🔄 Establish regular backup schedule
8. 📝 Create maintenance schedule

---

**Guide Version:** 1.0  
**Created:** May 24, 2026  
**Last Updated:** May 24, 2026  
**Maintained By:** Development Team

---

*End of Deployment Guide*
