# ANTIGRAVITY MASTER SYSTEM COMMAND — OceanExotic
> Version: 1.0 | Last Updated: 2026-05-16 | Applies to ALL Antigravity sessions on this project.

---

## PROJECT IDENTITY

**OceanExotic** is a production-grade **LIVE Indian seafood marketplace** for Port Blair and Indian seafood buyers.

- **NOT** a frozen catalog ecommerce app.
- **NOT** a generic supermarket UI.
- **IS** a real-time harbor seafood marketplace with live daily inventory.

---

## FRAMEWORK RULES (MANDATORY)

### USE:
- Next.js latest stable version
- App Router only
- TypeScript strict mode
- Server Components by default
- Client Components only when necessary
- Tailwind CSS
- Responsive mobile-first design
- SEO-first architecture
- Dynamic metadata generation
- Suspense boundaries where needed
- Lazy loading for images/components
- Edge-ready architecture

### DO NOT:
- use deprecated pages router
- mix pages router and app router
- use unnecessary useEffect
- create hydration mismatch
- access window/document inside server components
- use localStorage in server components
- generate duplicate routes
- use inline anonymous heavy functions in render
- create circular imports
- use client components globally
- use static fake inventory
- use frozen seafood catalog logic

---

## MANDATORY SEAFOOD MARKETPLACE FEATURES

### ORDER OPTIONS (must appear BEFORE "Add to Cart"):
- Whole fish
- Curry cut
- Steak cut
- Fillet
- Cleaned / Un-cleaned
- Head on / Head off
- Skin on / Skin off

### CUT OPTION RULES:
- Each cut option must support dynamic pricing
- Inventory must update based on selected cut type
- Unavailable cut types must disable automatically
- Use controlled React forms
- Preserve selected options during cart updates

---

## TODAY'S CATCH SYSTEM (MOST IMPORTANT)

Build a **LIVE DAILY INVENTORY** system.

### Sellers/fishermen upload:
- Fresh catch
- Harbor inventory
- Quantity available
- Freshness timestamp
- Catch images
- Available cut types

### Rules:
- Inventory auto-expires daily
- Old stock archives automatically
- Homepage prioritizes today's inventory
- No fake stock persistence
- Sold out items update in realtime
- Freshness status must be visible

### Homepage Sections (MANDATORY):
- Today's Catch
- Morning Catch
- Fresh Harbor Stock
- Limited Daily Inventory

---

## PORT BLAIR LOCAL MARKET BEHAVIOR

### Prioritize:
- Freshness trust
- Harbor arrival inventory
- Same-day catch visibility
- Local seafood buyer habits
- Realtime stock updates

### Avoid:
- Supermarket UI patterns
- Frozen catalog structure
- Fake inventory counters
- Stale products

---

## NEXT.JS ARCHITECTURE RULES

### App Router Structure:
```
/app
  /(public)
  /(seller)
  /(admin)
  /(delivery)
  /api
```

### Mandatory files per route:
- `loading.tsx`
- `error.tsx`
- `not-found.tsx`
- `metadata` export
- Server actions where appropriate

---

## DATA FETCHING RULES

### USE:
- Server-side fetching by default
- React `cache()` where useful
- Streaming rendering where needed
- ISR for SEO pages
- SSR for realtime inventory pages

### DO NOT:
- Fetch critical data entirely on client side
- Use excessive polling
- Duplicate API calls

---

## REDIS RULES

Use Redis for:
- Realtime inventory
- Cart sessions
- Queue workers
- Flash sale stock
- WebSocket sync
- Caching today's catch

---

## QUEUE WORKERS (BullMQ + Redis)

Background jobs:
- AI SEO generation
- Image optimization
- Notifications
- Sitemap generation
- Inventory expiration
- Seller analytics

---

## DOCKER RULES

Containers:
- Frontend
- Backend
- Redis
- PostgreSQL
- Workers

Provide: `Dockerfile`, `docker-compose.yml`, production-safe env setup.

---

## DATABASE RULES (PostgreSQL)

### Mandatory Tables:
- `products`
- `todays_catch`
- `product_cut_options`
- `sellers`
- `orders`
- `order_items`
- `inventory_logs`

### Rules:
- Indexed queries
- UUID primary keys
- Normalized structure
- Soft delete where needed

---

## SEO RULES

### Generate:
- Dynamic metadata
- Structured schema
- OpenGraph tags
- Canonical URLs
- Sitemap entries

### SEO Pages:
- `/todays-catch`
- `/fresh-fish-port-blair`
- `/harbor-catch`
- Dynamic fish pages

### Schema Types:
- JSON-LD Product schema
- LocalBusiness schema
- FAQ schema

---

## IMAGE RULES

### USE:
- `next/image` only
- WebP/AVIF format
- Lazy loading
- Blur placeholders
- CDN optimization

### DO NOT:
- Use raw `<img>` tags
- Load huge images
- Block rendering

---

## STATE MANAGEMENT

- Zustand or React Context minimally
- Server state from server components
- Avoid unnecessary global state

---

## AUTH RULES

- Supabase Auth or JWT
- Role-based access control

### Roles:
- `customer`
- `fisherman`
- `seller`
- `admin`
- `delivery_partner`

---

## ERROR PREVENTION (MANDATORY)

### Prevent:
- Hydration mismatch
- Undefined state errors
- Null rendering crashes
- Invalid server/client boundaries
- Route conflicts
- Memory leaks

### Enforce:
- Strict TypeScript typing
- Input validation with Zod schemas
- Safe async handling
- Proper loading states

---

## MOBILE APP COMPATIBILITY

Architecture must support future **Expo React Native** app:
- Shared API layer
- Reusable business logic
- Reusable Zod validation schemas
- Do NOT tightly couple frontend logic

---

## PERFORMANCE TARGETS

- Lighthouse 90+
- Mobile-first optimization
- Fast image delivery via CDN
- Low JS bundle size
- Code splitting + dynamic imports
- Route-level optimization

---

## FINAL IDENTITY

OceanExotic behaves like:
- ✅ A live seafood harbor marketplace
- ✅ A trusted Port Blair fish exchange
- ✅ A realtime fresh inventory platform

OceanExotic is NOT:
- ❌ A generic ecommerce seafood store
- ❌ A frozen supermarket app
- ❌ A static catalog website

---
*This file is the canonical master rule set for all Antigravity sessions on this project.*
