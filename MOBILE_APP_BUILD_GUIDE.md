# 📱 OceanExotic Mobile App - Android Build Guide

**Framework:** React Native (Expo SDK 54)  
**Target:** Android APK/AAB  
**Guide Version:** 1.0  
**Last Updated:** May 24, 2026

---

## 📋 Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Project Setup](#2-project-setup)
3. [Development Testing](#3-development-testing)
4. [Production Configuration](#4-production-configuration)
5. [Building APK (Testing)](#5-building-apk-testing)
6. [Building AAB (Google Play)](#6-building-aab-google-play)
7. [Publishing to Google Play](#7-publishing-to-google-play)
8. [OTA Updates](#8-ota-updates)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

### 1.1 Required Accounts

- [ ] **Expo Account** (Free)
  - Sign up: https://expo.dev/signup
  - Needed for cloud builds

- [ ] **Google Play Developer Account** ($25 one-time fee)
  - Register: https://play.google.com/console
  - Needed for publishing to Play Store

### 1.2 Required Software

**On Your Development Machine:**

```bash
# Node.js 18+ (check version)
node --version

# npm or pnpm
npm --version

# Expo CLI
npm list -g expo-cli

# EAS CLI (install if not present)
npm install -g eas-cli
```

---

## 2. Project Setup

### 2.1 Navigate to Mobile Directory

```bash
cd /path/to/FISH_MARKET/mobile
```

### 2.2 Install Dependencies

```bash
# Install all dependencies
npm install

# Or using pnpm
pnpm install

# Verify installation
npx expo doctor
```

### 2.3 Login to Expo

```bash
# Login with your Expo account
eas login

# If you don't have an account, create one first:
# https://expo.dev/signup
```

### 2.4 Configure EAS Build

```bash
# Initialize EAS Build for your project
eas build:configure

# This will:
# - Create eas.json if it doesn't exist
# - Link project to your Expo account
# - Generate projectId
```

---

## 3. Development Testing

### 3.1 Test with Expo Go (Quickest)

```bash
# Start development server
npm run dev

# Or
npx expo start --web --port 8082
```

**On Your Android Phone:**

1. Install **Expo Go** from Google Play Store
2. Scan QR code from terminal
3. App loads on your phone
4. Changes reflect instantly

---

### 3.2 Test with Development Build

```bash
# Build development APK
eas build --platform android --profile development

# Install on connected device
adb install path/to/build.apk
```

**Benefits:**
- Full native functionality
- No Expo Go required
- Better performance testing

---

## 4. Production Configuration

### 4.1 Update Environment Variables

```bash
# Create production env file
nano .env.production
```

**Content:**

```env
# Production API URL
EXPO_PUBLIC_API_URL=https://oceanexotic.com/api
EXPO_PUBLIC_API_PORT=443

# App Configuration
EXPO_PUBLIC_APP_ENV=production
```

---

### 4.2 Update app.json for Production

```bash
nano app.json
```

**Production Configuration:**

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
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/YOUR_PROJECT_ID"
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
      "usesCleartextTraffic": false,
      "enableDangerousExperimentalLeanBuilds": false
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
    "plugins": [
      "expo-router",
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/Inter-Regular.ttf",
            "./assets/fonts/Inter-Bold.ttf",
            "./assets/fonts/Inter-Black.ttf"
          ]
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID_HERE"
      },
      "router": {}
    }
  }
}
```

**Important Changes:**
- `usesCleartextTraffic`: Set to `false` for production (HTTPS only)
- `NSAllowsArbitraryLoads`: Set to `false` for iOS
- `package`: Use your unique package name
- `versionCode`: Increment with each release

---

### 4.3 Update API Configuration

**Check your API service file:**

```bash
# Find your API configuration file
find src -name "*api*" -o -name "*config*"
```

**Ensure it uses production URL:**

```typescript
import Constants from 'expo-constants';

const API_URL = __DEV__
  ? 'http://192.168.0.199:8081/FISH_MARKET/api'  // Development
  : 'https://oceanexotic.com/api';                // Production

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

### 4.4 Configure eas.json

```bash
nano eas.json
```

**Configuration:**

```json
{
  "cli": {
    "version": ">= 10.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleDebug"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease",
        "image": "latest"
      },
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      },
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-api-key.json",
        "track": "internal"
      }
    }
  }
}
```

---

## 5. Building APK (Testing)

### 5.1 Build Preview APK

```bash
# Build APK for testing/distribution
eas build --platform android --profile preview

# This will:
# - Upload your code to Expo servers
# - Build Android APK in the cloud (~10-20 minutes)
# - Provide download link
```

**Alternative: Build Locally**

```bash
# Build on your machine (faster, but requires Android SDK)
eas build --platform android --profile preview --local
```

---

### 5.2 Download and Test APK

**After Build Completes:**

1. Download APK from provided link
2. Transfer to Android device:
   - Email to yourself
   - Upload to Google Drive
   - Use `adb install`

**Install via ADB:**

```bash
# Connect Android device via USB
# Enable USB Debugging in Developer Options

# Install APK
adb install path/to/oceanexotic-mobile.apk

# Or reinstall if already installed
adb install -r path/to/oceanexotic-mobile.apk
```

---

### 5.3 Test APK on Device

**Testing Checklist:**

- [ ] App installs successfully
- [ ] App launches without crashes
- [ ] Login/Register works
- [ ] Product listing loads
- [ ] Product images display
- [ ] Add to cart works
- [ ] Checkout flow completes
- [ ] Orders appear in history
- [ ] Profile updates work
- [ ] Push notifications (if implemented)
- [ ] Offline mode (if applicable)

---

### 5.4 Distribute APK to Testers

**Option 1: Direct Download Link**

Upload APK to cloud storage and share link:
- Google Drive
- Dropbox
- Firebase App Distribution

**Option 2: Firebase App Distribution**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Distribute to testers
firebase appdistribution:distribute oceanexotic-mobile.apk \
  --app "1:YOUR_APP_ID:android:YOUR_APP_ID" \
  --testers "test1@example.com,test2@example.com" \
  --release-notes "Version 1.0.0 - Initial Release"
```

---

## 6. Building AAB (Google Play)

### 6.1 Build Production Bundle

```bash
# Build Android App Bundle (AAB) for Google Play
eas build --platform android --profile production

# This creates .aab file (not .apk)
# AAB is required for Google Play Store
```

**Build Time:** 15-30 minutes

---

### 6.2 Generate Signing Key (First Time Only)

```bash
# Generate keystore for signing
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore oceanexotic-release-key.keystore \
  -alias oceanexotic-key \
  -keyalg RSA \
  -keysize 2096 \
  -validity 10000

# You'll be prompted for:
# - Keystore password
# - Name, organization, location
# - Key password

# BACK UP THIS FILE SECURELY!
# Loss = cannot update app on Play Store
```

**Store in safe location:**
- Password manager
- Encrypted backup
- Team secure storage

---

### 6.3 Configure App Signing

**If using Google Play App Signing (Recommended):**

1. Upload AAB to Google Play Console
2. Google will manage signing keys
3. You only need to back up upload key

**Manual Configuration:**

```bash
# Update eas.json with keystore path
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease",
        "keystore": {
          "keystorePath": "oceanexotic-release-key.keystore",
          "keystorePassword": "YOUR_PASSWORD",
          "keyAlias": "oceanexotic-key",
          "keyPassword": "YOUR_PASSWORD"
        }
      }
    }
  }
}
```

---

## 7. Publishing to Google Play

### 7.1 Prepare Store Listing

**Login to Google Play Console:**
https://play.google.com/console

**Create New App:**

1. Click "Create App"
2. App name: **OceanExotic**
3. Default language: English
4. App or game: App
5. Free or paid: Free

---

### 7.2 Complete Store Listing

**Required Assets:**

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| App Icon | 512x512 | PNG | No transparency |
| Feature Graphic | 1024x500 | PNG/JPG | Hero image |
| Phone Screenshots | Min 2 | PNG/JPG | 16:9 or 9:16 |
| Tablet Screenshots | Optional | PNG/JPG | 7" and 10" |
| Short Description | 80 chars | Text | Tagline |
| Full Description | 4000 chars | Text | Detailed info |

**Screenshots to Capture:**

1. Home screen with products
2. Product detail page
3. Cart/Checkout flow
4. User profile
5. Order history

---

### 7.3 Content Rating

**Complete Questionnaire:**

- Age rating (usually 3+ or 4+)
- Content categories
- Data safety information
- Privacy policy URL

**Privacy Policy Requirements:**
- Must be accessible URL
- Explain data collection
- Explain data usage
- Contact information

**Example Privacy Policy URL:**
```
https://oceanexotic.com/privacy
```

---

### 7.4 Upload App Bundle

**Via Console:**

1. Go to "Production" or "Internal Testing"
2. Click "Create new release"
3. Upload `.aab` file
4. Add release notes
5. Review and submit

**Via EAS CLI (Automated):**

```bash
# Submit to Google Play
eas submit --platform android --profile production

# Follow prompts:
# - Upload keystore (if not in project)
# - Enter keystore credentials
# - Choose track (internal, alpha, beta, production)
```

---

### 7.5 Release Tracks

| Track | Visibility | Review Time | Use Case |
|-------|-----------|-------------|----------|
| **Internal** | Testers only | Instant | Team testing |
| **Alpha** | Testers only | 1-2 days | Limited beta |
| **Beta** | Public opt-in | 1-3 days | Public beta |
| **Production** | Everyone | 1-7 days | Live release |

**Recommended Flow:**
```
Internal Testing → Beta → Production
```

---

### 7.6 Review Process

**What Google Checks:**

- ✅ Policy compliance
- ✅ Content appropriateness
- ✅ Functionality
- ✅ Data safety
- ✅ Privacy policy
- ✅ Metadata accuracy

**Common Rejection Reasons:**

- ❌ Missing privacy policy
- ❌ Incomplete store listing
- ❌ Crashes during review
- ❌ Misleading metadata
- ❌ Policy violations

**If Rejected:**
1. Read rejection reason carefully
2. Fix the issue
3. Resubmit
4. Usually approved within 24 hours on resubmission

---

### 7.7 Publish to Production

**Final Steps:**

1. Go to Production track
2. Create release
3. Upload AAB
4. Add release notes
5. Review rollout percentage (start with 10-20%)
6. Click "Review release"
7. Wait for approval (1-7 days)
8. Once approved, click "Start rollout"

**Rollout Strategy:**

```
Day 1:  10% of users
Day 2:  25% of users (if no critical bugs)
Day 3:  50% of users
Day 5:  100% of users
```

---

## 8. OTA Updates

### 8.1 What are OTA Updates?

**OTA (Over-The-Air) Updates:**
- Update JavaScript code without resubmitting to Play Store
- Users get updates automatically
- Cannot update native code (requires rebuild)

**Perfect for:**
- Bug fixes
- UI changes
- Content updates
- Feature toggles

---

### 8.2 Publish OTA Update

```bash
# Publish update
eas update --branch production --message "Fix checkout bug"

# This will:
# - Bundle JavaScript
# - Upload to Expo servers
# - Users receive update on next app launch
```

**Check Update Status:**

```bash
# View update history
eas update:list

# View specific branch
eas update:list --branch production
```

---

### 8.3 Rollback Update

```bash
# If update causes issues, rollback
eas update:rollback

# Or republish previous version
eas update --branch production --message "Rollback to v1.0.0"
```

---

### 8.4 Update Channels

```json
{
  "build": {
    "production": {
      "channel": "production",
      "android": {
        "buildType": "app-bundle"
      }
    },
    "preview": {
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

**Channel Strategy:**
- `production`: Stable releases
- `preview`: Beta testing
- `development`: Internal testing

---

## 9. Troubleshooting

### 9.1 Build Failures

**Error: "Build failed"**

```bash
# Check build logs
eas build:view <BUILD_ID>

# Common fixes:
# 1. Update dependencies
npm update

# 2. Clear cache
npx expo start --clear

# 3. Check for TypeScript errors
npx tsc --noEmit

# 4. Verify app.json syntax
npx expo-doctor
```

---

### 9.2 App Crashes on Launch

**Debug Steps:**

```bash
# View device logs
adb logcat | grep -i "expo\|react"

# Or use Expo Dev Client
npx expo start --dev-client

# Check for missing dependencies
npm ls

# Reinstall dependencies
rm -rf node_modules
npm install
```

---

### 9.3 API Connection Issues

**Problem:** App can't connect to API

**Solutions:**

```bash
# 1. Verify API URL in .env
cat .env.production

# 2. Test API endpoint
curl https://oceanexotic.com/api/products/list.php

# 3. Check for CORS issues
# Add to PHP API headers:
header("Access-Control-Allow-Origin: *");

# 4. Ensure HTTPS (not HTTP)
# Production must use https://
```

---

### 9.4 Build Too Large

**Problem:** APK/AAB size exceeds limits

**Solutions:**

```json
// In app.json, optimize assets
{
  "expo": {
    "assetBundlePatterns": [
      "assets/**"
    ],
    "android": {
      "enableDangerousExperimentalLeanBuilds": true
    }
  }
}
```

**Compress images:**
```bash
# Use TinyPNG or ImageOptim
# Reduce image quality to 80%
# Remove unused assets
```

---

### 9.5 Signing Key Lost

**CRITICAL:** Cannot update app without signing key

**Solutions:**

1. **If using Google Play App Signing:**
   - Contact Google Play support
   - Request key reset
   - Generate new upload key

2. **If managing own keys:**
   - Check backups
   - Check team members
   - If truly lost, must publish as new app

**Prevention:**
- Store in password manager
- Multiple encrypted backups
- Team access (secure)

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
eas login                      # Login to Expo
eas whoami                     # Check logged in user

# Building
eas build --platform android --profile development    # Dev build
eas build --platform android --profile preview        # Test APK
eas build --platform android --profile production     # Play Store AAB
eas build --platform android --profile preview --local # Local build

# Submitting
eas submit --platform android  # Submit to Play Store
eas update --branch production --message "Bug fix"    # OTA update

# Managing
eas build:list                 # View build history
eas update:list                # View update history
eas device:list                # View registered devices

# Utilities
npx expo doctor                # Check project health
npx expo start --clear         # Clear cache and start
adb install build.apk          # Install APK via ADB
adb logcat | grep expo         # View logs
```

---

## Build Profiles Summary

| Profile | Type | Use Case | Distribution |
|---------|------|----------|--------------|
| **development** | APK | Development testing | Expo Go / Dev Client |
| **preview** | APK | Beta testing | Direct download / Firebase |
| **production** | AAB | Play Store release | Google Play Store |

---

## Estimated Costs

| Service | Cost | Notes |
|---------|------|-------|
| Expo Account | Free | Cloud builds included |
| EAS Build | Free tier: 30 builds/month | $29/mo for unlimited |
| Google Play Developer | $25 one-time | Lifetime access |
| Firebase Distribution | Free | Up to 10 testers |
| **Total First Year** | **$25** | Using free tiers |

---

## Checklist: Before Publishing

- [ ] All features tested and working
- [ ] API endpoints use HTTPS
- [ ] No hardcoded development URLs
- [ ] App icon and splash screen ready
- [ ] Screenshots captured (min 2)
- [ ] Privacy policy published
- [ ] Store listing completed
- [ ] Content rating questionnaire done
- [ ] Signing key backed up securely
- [ ] Version code set (starts at 1)
- [ ] Release notes written
- [ ] Testers registered (for internal track)
- [ ] Rollout strategy planned

---

## Support Resources

- **Expo Docs:** https://docs.expo.dev
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Google Play Console Help:** https://support.google.com/googleplay/android-developer
- **React Native Docs:** https://reactnative.dev/docs/getting-started
- **Expo Forums:** https://forums.expo.dev

---

**Guide Version:** 1.0  
**Created:** May 24, 2026  
**Project:** OceanExotic Mobile App
