# 🐟 OceanExotic Product Moderation System - Comprehensive Blueprint

**Document Version:** 1.0  
**Created:** May 24, 2026  
**Status:** Awaiting Authorization  
**Based On:** Complete System Field Analysis

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Field Analysis](#current-system-field-analysis)
3. [Database Schema Enhancements](#database-schema-enhancements)
4. [API Endpoints Architecture](#api-endpoints-architecture)
5. [Excel Import Specification](#excel-import-specification)
6. [Admin Interface Design](#admin-interface-design)
7. [Frontend Integration Strategy](#frontend-integration-strategy)
8. [Implementation Phases](#implementation-phases)
9. [Technical Considerations](#technical-considerations)
10. [Authorization Checklist](#authorization-checklist)

---

## Executive Summary

This blueprint outlines a complete **Product Moderation System** for the OceanExotic marketplace, enabling:

- ✅ **Product CRUD Operations** - Add, edit, delete with moderation workflow
- ✅ **Excel Bulk Import** - Upload product catalogs from spreadsheets
- ✅ **Moderation Queue** - Review and approve products before going live
- ✅ **Admin Dashboard** - Complete product management interface
- ✅ **Frontend Integration** - Seamless customer-facing updates

**Key Discovery:** After thorough analysis of the existing system, we identified 5 database tables, 18 product fields, and complex relationships between products, sellers, inventory, cut options, location overrides, and preparation options.

---

## Current System Field Analysis

### 1. PRODUCTS TABLE - ACTUAL SCHEMA (Verified)

| Field | Type | Nullable | Default | Current Usage | Notes |
|-------|------|----------|---------|---------------|-------|
| `id` | VARCHAR(50) | NO | - | Primary Key | Format: PRD-AND-01, surmai-seer-fish |
| `seller_id` | VARCHAR(50) | NO | - | FK to sellers | Format: SEL-USR-1778761853233 |
| `name` | VARCHAR(255) | NO | - | Product name | e.g. "Red Snapper (Lal Haril)" |
| `category` | VARCHAR(100) | NO | - | Category | Values: SEAWATER FISH, FRESHWATER FISH, PRAWNS & SHRIMPS, CRABS & LOBSTERS, STEAKS & FILLETS, EXOTIC CATCH, READY TO COOK, COASTAL DRY FISH |
| `price` | DECIMAL(10,2) | NO | - | Base price | e.g. 250.00 |
| `stock` | DECIMAL(10,2) | YES | 0.00 | Quantity | e.g. 100.00 |
| `status` | **VARCHAR(50)** | YES | 'ACTIVE' | **NOT ENUM** | Values: ACTIVE, OUT_OF_STOCK, ARCHIVED, PUBLISHED, PENDING AUDIT |
| `image_url` | **LONGTEXT** | YES | - | Primary image | URL or path |
| `gallery` | **LONGTEXT** | YES | - | JSON array | Format: '["url1","url2"]' |
| `description` | **LONGTEXT** | YES | - | Product description | Rich text |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto-set | Record creation |
| `freshness_timestamp` | DATETIME | YES | NULL | Live catch time | From todays_catch sync |
| `catch_date` | DATE | YES | NULL | Catch date | Format: YYYY-MM-DD |
| `harbor_node` | VARCHAR(100) | YES | 'Port Blair Harbor' | Source location | e.g. Junglighat Harbor |
| `is_live_inventory` | TINYINT(1) | YES | 0 | Live flag | 0 or 1 |
| `unit` | VARCHAR(20) | YES | 'kg' | Measurement | Values: kg, PCS, PKT |
| `nutrition` | **LONGTEXT** | YES | NULL | JSON object | Format: '{"protein":"20g","omega3":"300mg","calories":"100 kcal","fat":"2g"}' |
| `quality_rank` | VARCHAR(50) | YES | 'VERIFIED' | Quality grade | Values: VERIFIED, ELITE |

**Sample Product Data:**
```
id: 'PRD-AND-01'
seller_id: 'SEL-USR-1778761853233'
name: 'Red Snapper (Lal Haril)'
category: 'SEAWATER FISH'
price: '250.00'
stock: '100.00'
status: 'ACTIVE'
image_url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=600&q=80'
gallery: '["/uploads/original/1779598351577-1779565005169.png","/uploads/original/1779598399677-88.png"]'
description: 'Premium reef-caught Red Snapper, known locally as Lal Haril. Firm white meat with a sweet, mild flavor, perfect for traditional curries.'
created_at: '2026-05-24 00:32:41'
freshness_timestamp: NULL
catch_date: '0000-00-00'
harbor_node: 'Junglighat Harbor'
is_live_inventory: 0
unit: 'kg'
nutrition: '{"protein":"20g","omega3":"300mg","calories":"100 kcal","fat":"2g"}'
quality_rank: 'VERIFIED'
```

### 2. TODAYS_CATCH TABLE - ACTUAL SCHEMA

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | VARCHAR(50) | NO | - | PK, Format: TC-001, CTH-uniqid |
| `product_id` | VARCHAR(50) | NO | - | FK to products |
| `seller_id` | VARCHAR(50) | NO | - | FK to sellers |
| `catch_date` | DATE | NO | - | Daily batch date |
| `harbor_node` | VARCHAR(100) | NO | 'Port Blair Harbor' | Source |
| `quantity_kg` | DECIMAL(10,2) | NO | 0.00 | Initial quantity |
| `remaining_kg` | DECIMAL(10,2) | NO | 0.00 | Available stock |
| `price_per_kg` | DECIMAL(10,2) | NO | - | Live pricing |
| `freshness_timestamp` | DATETIME | NO | - | Catch timestamp |
| `expires_at` | DATETIME | NO | - | 24hr expiry |
| `catch_image_url` | TEXT | YES | NULL | Catch photo |
| `batch_label` | VARCHAR(50) | YES | 'TODAY' | Values: MORNING, AFTERNOON, EVENING |
| `status` | VARCHAR(30) | YES | 'FRESH' | Values: FRESH, SELLING_FAST, SOLD_OUT, ARCHIVED |
| `notes` | TEXT | YES | NULL | Additional info |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto-update |

### 3. PRODUCT_CUT_OPTIONS TABLE

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | VARCHAR(50) | NO | - | PK, Format: CUT-SM-01 |
| `product_id` | VARCHAR(50) | NO | - | FK to products |
| `cut_type` | VARCHAR(50) | NO | - | Values: WHOLE, CURRY_CUT, STEAK_CUT, FILLET, CLEANED, UNCLEANED, HEAD_ON, HEAD_OFF, SKIN_ON, SKIN_OFF |
| `price_modifier_percent` | DECIMAL(5,2) | YES | 0.00 | Percentage add-on |
| `price_flat_add` | DECIMAL(10,2) | YES | 0.00 | Fixed ₹ add-on |
| `is_available` | TINYINT(1) | YES | 1 | Availability flag |
| `stock_kg` | DECIMAL(10,2) | YES | NULL | NULL = inherits from todays_catch |
| `sort_order` | INT(11) | YES | 0 | Display order |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto |

### 4. PRODUCT_LOCATION_OVERRIDES TABLE

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | VARCHAR(50) | NO | - | PK, Format: LOCOV-uniqid |
| `product_id` | VARCHAR(50) | NO | - | FK to products |
| `territory_name` | VARCHAR(100) | NO | - | Area name |
| `price` | DECIMAL(10,2) | YES | NULL | Override price |
| `stock` | DECIMAL(10,2) | YES | NULL | Override stock |
| `is_visible` | TINYINT(1) | YES | 1 | Visibility flag |
| `status` | VARCHAR(30) | YES | 'ACTIVE' | Values: ACTIVE, COMING_SOON, OUT_OF_STOCK |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto-update |

### 5. PRODUCT_PREP_OPTIONS TABLE

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | VARCHAR(50) | NO | - | PK, Format: PREP-uniqid |
| `product_id` | VARCHAR(50) | NO | - | FK to products |
| `prep_type` | VARCHAR(50) | NO | - | Values: RAW, FRIED, MARINATED, GRILLED |
| `name` | VARCHAR(255) | NO | - | Display name |
| `price_flat_add` | DECIMAL(10,2) | YES | 0.00 | Extra cost |
| `is_available` | TINYINT(1) | YES | 1 | Availability |
| `sort_order` | INT(11) | YES | 0 | Display order |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto |
| `updated_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto-update |

### 6. SELLERS TABLE

| Field | Type | Nullable | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | VARCHAR(50) | NO | - | PK, Format: SEL-USR-xxx |
| `name` | VARCHAR(255) | NO | - | Seller name |
| `email` | VARCHAR(255) | NO | - | Contact email |
| `rating` | DECIMAL(3,2) | YES | 5.00 | Seller rating |
| `status` | VARCHAR(50) | YES | 'ACTIVE' | Status |
| `created_at` | TIMESTAMP | NO | CURRENT_TIMESTAMP | Auto |

---

## Database Schema Enhancements

### New Tables Required

#### 1. Product Moderation Queue

```sql
CREATE TABLE IF NOT EXISTS product_moderation_queue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL UNIQUE,
  submitted_by VARCHAR(50) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  review_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED') DEFAULT 'PENDING',
  reviewed_by VARCHAR(50) NULL,
  reviewed_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  notes TEXT NULL,
  INDEX idx_review_status (review_status),
  INDEX idx_priority (priority),
  INDEX idx_submitted_at (submitted_at),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Purpose:** Tracks products awaiting moderation review

**Key Fields:**
- `review_status`: PENDING → APPROVED/REJECTED/REVISION_REQUESTED
- `priority`: Helps moderators prioritize urgent products
- `rejection_reason`: Feedback for sellers

#### 2. Product Moderation Audit Log

```sql
CREATE TABLE IF NOT EXISTS product_moderation_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  action ENUM('CREATED', 'UPDATED', 'DELETED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'IMPORTED') NOT NULL,
  performed_by VARCHAR(50) NOT NULL,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  previous_state JSON NULL,
  new_state JSON NULL,
  notes TEXT NULL,
  INDEX idx_product (product_id),
  INDEX idx_action (action),
  INDEX idx_performed_by (performed_by),
  INDEX idx_performed_at (performed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Purpose:** Complete audit trail for compliance and debugging

**Tracked Actions:**
- Product creation/update/deletion
- Moderation submissions
- Approval/rejection decisions
- Bulk imports

#### 3. Product Import Sessions

```sql
CREATE TABLE IF NOT EXISTS product_import_sessions (
  id VARCHAR(50) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  total_records INT DEFAULT 0,
  processed_records INT DEFAULT 0,
  successful_records INT DEFAULT 0,
  failed_records INT DEFAULT 0,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  error_log JSON NULL,
  uploaded_by VARCHAR(50) NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_status (status),
  INDEX idx_uploaded_by (uploaded_by),
  INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Purpose:** Track Excel import progress and results

**Features:**
- Real-time progress tracking
- Error logging per row
- Import history

### Products Table Enhancement

```sql
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS moderation_status ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION') DEFAULT 'APPROVED' AFTER status,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NULL AFTER moderation_status,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL AFTER submitted_at,
  ADD COLUMN IF NOT EXISTS approved_by VARCHAR(50) NULL AFTER approved_at,
  ADD COLUMN IF NOT EXISTS import_session_id VARCHAR(50) NULL AFTER approved_by,
  ADD COLUMN IF NOT EXISTS external_ref VARCHAR(100) NULL AFTER import_session_id,
  ADD COLUMN IF NOT EXISTS min_order INT DEFAULT 1 AFTER unit,
  ADD INDEX idx_moderation_status (moderation_status),
  ADD INDEX idx_import_session (import_session_id);
```

**New Fields:**
- `moderation_status`: Workflow state (PENDING/APPROVED/REJECTED/NEEDS_REVISION)
- `submitted_at`: When product entered moderation queue
- `approved_at`: When product was approved
- `approved_by`: Admin who approved
- `import_session_id`: Link to bulk import session
- `external_ref`: External reference (Excel row number, SKU, etc.)
- `min_order`: Minimum order quantity (missing from current schema)

---

## API Endpoints Architecture

### 1. Admin Product Management

**Base URL:** `/api/admin/products.php`

#### GET - List Products

**Query Parameters:**
```
?status=ACTIVE|OUT_OF_STOCK|ARCHIVED
?moderation_status=PENDING|APPROVED|REJECTED
?category=SEAWATER FISH
?seller_id=SEL-xxx
?search=keyword
?sort=created_at|price|name
?order=ASC|DESC
?page=1
?limit=20
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "PRD-AND-01",
      "name": "Red Snapper (Lal Haril)",
      "category": "SEAWATER FISH",
      "price": 250.00,
      "stock": 100.00,
      "status": "ACTIVE",
      "moderation_status": "APPROVED",
      "seller_id": "SEL-USR-1778761853233",
      "image_url": "https://...",
      "created_at": "2026-05-24 00:32:41"
    }
  ],
  "pagination": {
    "total": 156,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

#### GET - Single Product

**URL:** `/api/admin/products.php?id=PRD-AND-01`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "PRD-AND-01",
    "name": "Red Snapper (Lal Haril)",
    "category": "SEAWATER FISH",
    "price": 250.00,
    "stock": 100.00,
    "status": "ACTIVE",
    "moderation_status": "APPROVED",
    "image_url": "https://...",
    "gallery": "[\"url1\",\"url2\"]",
    "description": "Premium reef-caught...",
    "nutrition": "{\"protein\":\"20g\",\"omega3\":\"300mg\"}",
    "cut_options": [
      {
        "id": "CUT-SM-01",
        "cut_type": "WHOLE",
        "price_modifier_percent": 0.00,
        "price_flat_add": 0.00,
        "is_available": 1
      }
    ],
    "prep_options": [...],
    "location_overrides": [...],
    "moderation_history": [
      {
        "action": "APPROVED",
        "performed_by": "ADMIN-001",
        "performed_at": "2026-05-24 10:30:00",
        "notes": "Approved - meets quality standards"
      }
    ]
  }
}
```

#### POST - Create Product

**Request Body:**
```json
{
  "name": "Bluefin Tuna Saku Grade",
  "seller_id": "SEL-001",
  "category": "SEAWATER FISH",
  "price": 1850.00,
  "stock": 50,
  "unit": "kg",
  "status": "ACTIVE",
  "description": "Premium saku-grade bluefin tuna...",
  "image_url": "/uploads/products/bluefin-tuna.jpg",
  "gallery": ["/uploads/products/bluefin-1.jpg", "/uploads/products/bluefin-2.jpg"],
  "is_live_inventory": 1,
  "harbor_node": "Phoenix Bay Harbor",
  "catch_date": "2026-05-24",
  "nutrition": {
    "protein": "25g",
    "omega3": "500mg",
    "calories": "150 kcal",
    "fat": "5g"
  },
  "quality_rank": "ELITE",
  "cut_options": [
    {"cut_type": "WHOLE", "price_modifier_percent": 0, "price_flat_add": 0},
    {"cut_type": "FILLET", "price_modifier_percent": 15, "price_flat_add": 50}
  ],
  "prep_options": [
    {"prep_type": "RAW", "name": "Raw / Cleaned", "price_flat_add": 0},
    {"prep_type": "FRIED", "name": "Chettinad Fry Masala", "price_flat_add": 50}
  ],
  "location_overrides": [
    {"territory_name": "Port Blair", "price": 1850, "stock": 30, "is_visible": 1, "status": "ACTIVE"}
  ]
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "Product submitted for moderation",
  "data": {
    "id": "PRD-1716556800-1234",
    "moderation_status": "PENDING",
    "submitted_at": "2026-05-24T10:30:00Z"
  }
}
```

#### PUT - Update Product

**URL:** `/api/admin/products.php?id=PRD-AND-01`

**Note:** If critical fields change (price, name, category), reset `moderation_status` to PENDING

**Response:**
```json
{
  "status": "success",
  "message": "Product updated",
  "data": {
    "id": "PRD-AND-01",
    "moderation_status": "PENDING",
    "requires_re_approval": true
  }
}
```

#### DELETE - Soft Delete

**URL:** `/api/admin/products.php?id=PRD-AND-01`

**Response:**
```json
{
  "status": "success",
  "message": "Product archived"
}
```

### 2. Moderation Workflow

**Base URL:** `/api/admin/moderation.php`

#### GET - Moderation Queue

**Query Parameters:**
```
?status=PENDING|APPROVED|REJECTED
?priority=LOW|MEDIUM|HIGH|URGENT
?sort=submitted_at
```

**Response:**
```json
{
  "status": "success",
  "data": [...queue_items],
  "stats": {
    "pending": 24,
    "approved_today": 8,
    "rejected_today": 2
  }
}
```

#### POST - Approve Product

**URL:** `/api/admin/moderation.php?action=approve`

**Request Body:**
```json
{
  "product_id": "PRD-AND-01",
  "reviewer_id": "ADMIN-001",
  "notes": "Approved - meets quality standards"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Product approved and published"
}
```

#### POST - Reject Product

**URL:** `/api/admin/moderation.php?action=reject`

**Request Body:**
```json
{
  "product_id": "PRD-AND-01",
  "reviewer_id": "ADMIN-001",
  "rejection_reason": "Image quality insufficient",
  "notes": "Please upload high-resolution images"
}
```

#### POST - Request Revision

**URL:** `/api/admin/moderation.php?action=request_revision`

**Request Body:**
```json
{
  "product_id": "PRD-AND-01",
  "reviewer_id": "ADMIN-001",
  "rejection_reason": "Missing nutritional information",
  "notes": "Please complete nutrition fields"
}
```

### 3. Excel Import/Export

**Base URL:** `/api/admin/import.php`

#### POST - Upload Excel

**Content-Type:** `multipart/form-data`

**Fields:**
- `file`: Excel file (.xlsx, .xls, .csv)
- `auto_approve`: false (boolean)
- `notify_seller`: true (boolean)

**Response:**
```json
{
  "status": "success",
  "message": "Import initiated",
  "data": {
    "session_id": "IMP-1716556800-5678",
    "filename": "products_may2026.xlsx",
    "status": "PROCESSING"
  }
}
```

#### GET - Import Sessions

**Query:** `?status=COMPLETED`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "IMP-1716556800-5678",
      "filename": "products_may2026.xlsx",
      "total_records": 48,
      "successful_records": 45,
      "failed_records": 3,
      "status": "COMPLETED",
      "uploaded_at": "2026-05-24 10:00:00",
      "completed_at": "2026-05-24 10:05:00"
    }
  ]
}
```

#### GET - Session Details

**URL:** `/api/admin/import.php?session_id=IMP-xxx`

**Response:**
```json
{
  "status": "success",
  "data": {
    "session_id": "IMP-xxx",
    "filename": "products.xlsx",
    "total_records": 48,
    "successful_records": 45,
    "failed_records": 3,
    "errors": [
      {"row": 12, "error": "Missing seller_id"},
      {"row": 28, "error": "Invalid price"},
      {"row": 35, "error": "Category not recognized"}
    ]
  }
}
```

#### GET - Download Template

**URL:** `/api/admin/import.php?action=template`

**Returns:** Excel template file with proper column headers and sample data

### 4. Bulk Operations

**Base URL:** `/api/admin/products_bulk.php`

#### POST - Bulk Approve

**Request Body:**
```json
{
  "product_ids": ["PRD-001", "PRD-002"],
  "reviewer_id": "ADMIN-001"
}
```

#### POST - Bulk Reject

**Request Body:**
```json
{
  "product_ids": ["PRD-003"],
  "reason": "Duplicate products"
}
```

#### POST - Bulk Update Status

**Request Body:**
```json
{
  "product_ids": ["PRD-001"],
  "status": "OUT_OF_STOCK"
}
```

#### POST - Bulk Delete

**Request Body:**
```json
{
  "product_ids": ["PRD-004", "PRD-005"]
}
```

---

## Excel Import Specification

### Column Mapping (Based on Actual DB Fields)

#### Basic Product Information (Columns A-H)

| Column | Header | Required | Type | Format | Example | Validation |
|--------|--------|----------|------|--------|---------|------------|
| A | **product_id** | No* | Text | VARCHAR(50) | PRD-001 | Unique, auto-generated if empty |
| B | **seller_id** | Yes | Text | VARCHAR(50) | SEL-USR-1778761853233 | Must exist in sellers table |
| C | **name** | Yes | Text | VARCHAR(255) | Red Snapper (Lal Haril) | 3-255 characters |
| D | **category** | Yes | Text | VARCHAR(100) | SEAWATER FISH | Must be valid category |
| E | **price** | Yes | Number | DECIMAL(10,2) | 250.00 | > 0, max 99999.99 |
| F | **stock** | Yes | Number | DECIMAL(10,2) | 100 | >= 0 |
| G | **unit** | Yes | Text | VARCHAR(20) | kg | kg, PCS, PKT |
| H | **status** | Yes | Text | VARCHAR(50) | ACTIVE | ACTIVE, OUT_OF_STOCK, ARCHIVED |

#### Media & Description (Columns I-K)

| Column | Header | Required | Type | Format | Example | Validation |
|--------|--------|----------|------|--------|---------|------------|
| I | **description** | Yes | Text | LONGTEXT | Premium reef-caught... | 10-5000 characters |
| J | **image_url** | Yes | Text | LONGTEXT | /uploads/products/... | Valid URL or path |
| K | **gallery** | No | JSON | LONGTEXT | ["url1","url2"] | Valid JSON array |

#### Product Attributes (Columns L-O)

| Column | Header | Required | Type | Format | Example | Validation |
|--------|--------|----------|------|--------|---------|------------|
| L | **quality_rank** | No | Text | VARCHAR(50) | ELITE | VERIFIED, ELITE |
| M | **is_live_inventory** | Yes | Number | TINYINT(1) | 1 | 0 or 1 |
| N | **harbor_node** | Conditional** | Text | VARCHAR(100) | Phoenix Bay Harbor | Required if is_live_inventory=1 |
| O | **catch_date** | Conditional** | Date | DATE | 2026-05-24 | YYYY-MM-DD format |

#### Nutrition (Columns P-S)

| Column | Header | Required | Type | Format | Example |
|--------|--------|----------|------|--------|---------|
| P | **nutrition_protein** | No | Text | VARCHAR(50) | 20g |
| Q | **nutrition_omega3** | No | Text | VARCHAR(50) | 300mg |
| R | **nutrition_calories** | No | Text | VARCHAR(50) | 100 kcal |
| S | **nutrition_fat** | No | Text | VARCHAR(50) | 2g |

#### Advanced Options (Columns T-W) - JSON Format

| Column | Header | Required | Type | Notes |
|--------|--------|----------|------|-------|
| T | **cut_options** | No | JSON Array | Cut types with pricing |
| U | **prep_options** | No | JSON Array | Preparation services |
| V | **location_overrides** | No | JSON Array | Territory-specific pricing |
| W | **min_order** | No | Number | Minimum order quantity |

### JSON Field Formats

#### cut_options (Column T)

```json
[
  {
    "cut_type": "WHOLE",
    "price_modifier_percent": 0,
    "price_flat_add": 0,
    "is_available": 1
  },
  {
    "cut_type": "FILLET",
    "price_modifier_percent": 15,
    "price_flat_add": 50,
    "is_available": 1
  },
  {
    "cut_type": "CURRY_CUT",
    "price_modifier_percent": 0,
    "price_flat_add": 30,
    "is_available": 1
  }
]
```

**Valid cut_type values:**
- WHOLE
- CURRY_CUT
- STEAK_CUT
- FILLET
- CLEANED
- UNCLEANED
- HEAD_ON
- HEAD_OFF
- SKIN_ON
- SKIN_OFF

#### prep_options (Column U)

```json
[
  {
    "prep_type": "RAW",
    "name": "Raw / Cleaned",
    "price_flat_add": 0,
    "is_available": 1
  },
  {
    "prep_type": "FRIED",
    "name": "Chettinad Fry Masala",
    "price_flat_add": 50,
    "is_available": 1
  },
  {
    "prep_type": "MARINATED",
    "name": "Classic Tandoori Marinade",
    "price_flat_add": 80,
    "is_available": 1
  },
  {
    "prep_type": "GRILLED",
    "name": "Charcoal Grill Garlic Butter Rub",
    "price_flat_add": 100,
    "is_available": 1
  }
]
```

**Valid prep_type values:**
- RAW
- FRIED
- MARINATED
- GRILLED

#### location_overrides (Column V)

```json
[
  {
    "territory_name": "Port Blair",
    "price": 250,
    "stock": 50,
    "is_visible": 1,
    "status": "ACTIVE"
  },
  {
    "territory_name": "Havelock",
    "price": 280,
    "stock": 30,
    "is_visible": 1,
    "status": "ACTIVE"
  },
  {
    "territory_name": "Neil Island",
    "price": 300,
    "stock": 20,
    "is_visible": 1,
    "status": "ACTIVE"
  }
]
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| product_id | Unique, VARCHAR(50) | "Invalid product ID format or duplicate" |
| seller_id | Must exist in sellers table | "Seller not found: {seller_id}" |
| name | 3-255 characters | "Name must be between 3 and 255 characters" |
| category | Must be valid category | "Invalid category: {value}. Must be one of: SEAWATER FISH, FRESHWATER FISH, PRAWNS & SHRIMPS, CRABS & LOBSTERS, STEAKS & FILLETS, EXOTIC CATCH, READY TO COOK, COASTAL DRY FISH" |
| price | > 0, max 99999.99 | "Price must be between 0.01 and 99999.99" |
| stock | >= 0 | "Stock cannot be negative" |
| unit | kg, PCS, PKT | "Unit must be kg, PCS, or PKT" |
| status | ACTIVE, OUT_OF_STOCK, ARCHIVED | "Invalid status value" |
| description | 10-5000 characters | "Description must be between 10 and 5000 characters" |
| image_url | Valid URL or path | "Invalid image URL or path" |
| gallery | Valid JSON array | "Gallery must be a valid JSON array of URLs" |
| quality_rank | VERIFIED, ELITE | "Quality rank must be VERIFIED or ELITE" |
| is_live_inventory | 0 or 1 | "Must be 0 or 1" |
| harbor_node | Required if is_live_inventory=1 | "Harbor node required for live inventory" |
| catch_date | YYYY-MM-DD format | "Invalid date format. Use YYYY-MM-DD" |
| nutrition_* | Text values | "Must be text (e.g., '20g', '300mg')" |
| cut_options | Valid JSON | "Invalid JSON format for cut_options" |
| prep_options | Valid JSON | "Invalid JSON format for prep_options" |
| location_overrides | Valid JSON | "Invalid JSON format for location_overrides" |

### Sample Excel Row

```
product_id: PRD-SM-001
seller_id: SEL-USR-1778761853233
name: Surmai (Seer Fish) Premium
category: SEAWATER FISH
price: 1600.00
stock: 50
unit: kg
status: ACTIVE
description: Fresh Surmai (Seer Fish) sourced directly from Andaman local markets. Premium quality with firm texture and rich flavor.
image_url: https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800
gallery: ["https://img1.jpg","https://img2.jpg"]
quality_rank: ELITE
is_live_inventory: 1
harbor_node: Phoenix Bay Harbor
catch_date: 2026-05-24
nutrition_protein: 20g
nutrition_omega3: 300mg
nutrition_calories: 100 kcal
nutrition_fat: 2g
cut_options: [{"cut_type":"WHOLE","price_modifier_percent":0,"price_flat_add":0,"is_available":1},{"cut_type":"CURRY_CUT","price_modifier_percent":0,"price_flat_add":30,"is_available":1},{"cut_type":"FILLET","price_modifier_percent":15,"price_flat_add":50,"is_available":1}]
prep_options: [{"prep_type":"RAW","name":"Raw / Cleaned","price_flat_add":0,"is_available":1},{"prep_type":"FRIED","name":"Chettinad Fry Masala","price_flat_add":50,"is_available":1}]
location_overrides: [{"territory_name":"Port Blair","price":1600,"stock":30,"is_visible":1,"status":"ACTIVE"},{"territory_name":"Havelock","price":1650,"stock":20,"is_visible":1,"status":"ACTIVE"}]
min_order: 1
```

---

## Admin Interface Design

### 1. Product Listing Page (/admin/products)

#### Current Features (Maintained)
- ✅ Registry fetch from `/api/seller/products.php`
- ✅ Visual audit overlay
- ✅ Delete confirmation modal
- ✅ Desktop table + Mobile cards
- ✅ Links to add/edit pages

#### New Features to Add
- ➕ Moderation status column with color-coded badges
- ➕ Filter tabs: All | Pending (24) | Approved | Rejected
- ➕ Bulk action checkboxes
- ➕ Import Excel button (top right)
- ➕ Export button
- ➕ Moderation stats bar (top of page)
- ➕ Quick approve/reject actions in table

#### Enhanced Table Layout

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ ☐ | Image | Product Info | Seller | Category | Price | Stock | Status | Moderation | Actions │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ | 🐟    | Red Snapper  | SEL-001| SEAWATER | ₹250  | 100kg | ACTIVE | ✓APPROVED  | 👁 ✏️ 🗑 │
│     |       | (Lal Haril)  |        | FISH     |       |       |        |            |         │
│     |       | PRD-AND-01   |        |          |       |       |        |            |         │
├──────────────────────────────────────────────────────────────────────────────────────┤
│ ☐ | 🐟    | Bluefin Tuna | SEL-002| SEAWATER | ₹1850 | 50kg  | ACTIVE | ⏳PENDING  | 👁 ✓ ✏️ 🗑│
│     |       | Saku Grade   |        | FISH     |       |       |        |            |         │
│     |       | PRD-002      |        |          |       |       |        |            |         │
└──────────────────────────────────────────────────────────────────────────────────────┘

[Bulk Actions: ✓ Approve Selected | ✗ Reject Selected | 🗑 Delete Selected | 📧 Notify]
[Pagination: ← 1 2 3 ... 12 → | Showing 1-20 of 188 products]
```

### 2. Moderation Dashboard (/admin/moderation) - NEW PAGE

```
┌─────────────────────────────────────────────────────────────────┐
│ MODERATION COMMAND CENTER                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Stats Row]                                                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ ⏳Pending│ │ ✓Approved│ │ ✗Rejected│ │ 🔄Revision│          │
│ │    24    │ │   156    │ │    8     │ │    5     │          │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│ [Filter Bar]                                                    │
│ Status: [All ▼]  Priority: [All ▼]  Date: [Today ▼]  🔄 Reset │
│                                                                 │
│ [Queue Table]                                                   │
│ ┌──┬────────────┬──────────┬───────────┬──────────┬─────────┐ │
│ │☐ │ Product    │ Seller   │ Submitted │ Priority │ Actions │ │
│ ├──┼────────────┼──────────┼───────────┼──────────┼─────────┤ │
│ │☐ │ Bluefin    │ SEL-001  │ 2h ago    │ 🔴HIGH   │ 👁 ✓ ✗  │ │
│ │  │ Tuna Saku  │          │           │          │         │ │
│ │  │ PRD-002    │          │           │          │         │ │
│ ├──┼────────────┼──────────┼───────────┼──────────┼─────────┤ │
│ │☐ │ King Crab  │ SEL-002  │ 5h ago    │ 🟡MEDIUM │ 👁 ✓ ✗  │ │
│ │  │ Premium    │          │           │          │         │ │
│ │  │ PRD-003    │          │           │          │         │ │
│ └──┴────────────┴──────────┴───────────┴──────────┴─────────┘ │
│                                                                 │
│ [Bulk Actions]                                                  │
│ [✓ Approve Selected] [✗ Reject Selected] [📧 Notify Sellers]   │
│                                                                 │
│ [Pagination: ← 1 2 3 → | Showing 1-20 of 24 pending]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Product Review Modal

```
┌─────────────────────────────────────────────────────────────────┐
│ PRODUCT REVIEW WORKFLOW                                  [✕ Close]│
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Product Preview - Left Column]                                 │
│ ┌──────────────────────────────────────┐                       │
│ │                                      │                       │
│ │         Product Image                │                       │
│ │      (Main + Gallery Thumbnails)     │                       │
│ │                                      │                       │
│ └──────────────────────────────────────┘                       │
│                                                                 │
│ **Product Details**                                             │
│ Name: Red Snapper (Lal Haril)                                   │
│ ID: PRD-AND-01                                                  │
│ Category: SEAWATER FISH                                         │
│ Price: ₹250.00/kg                                               │
│ Stock: 100 kg                                                   │
│ Quality: VERIFIED                                               │
│ Live Inventory: No                                              │
│                                                                 │
│ **Description**                                                 │
│ Premium reef-caught Red Snapper, known locally as Lal Haril... │
│                                                                 │
│ **Cut Options**                                                 │
│ • WHOLE: Base price                                             │
│ • CURRY_CUT: +₹30                                               │
│ • FILLET: +15% + ₹50                                           │
│                                                                 │
│ **Location Overrides**                                          │
│ • Port Blair: ₹250 (100kg) ✓ Visible                           │
│ • Havelock: ₹280 (30kg) ✓ Visible                              │
│                                                                 │
│ **Preparation Options**                                         │
│ • RAW: Raw / Cleaned                                            │
│ • FRIED: Chettinad Fry Masala (+₹50)                            │
│ • MARINATED: Classic Tandoori Marinade (+₹80)                   │
│                                                                 │
│ **Nutrition**                                                   │
│ Protein: 20g | Omega-3: 300mg | Calories: 100 kcal | Fat: 2g   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Review Actions - Right Column]                                 │
│                                                                 │
│ **Moderation Status**                                           │
│ Current: ⏳ PENDING REVIEW                                      │
│ Submitted: 2026-05-24 10:30 AM                                  │
│ Submitted By: SEL-USR-1778761853233 (Rig Fishing Haddo)         │
│ Priority: 🟡 MEDIUM                                             │
│                                                                 │
│ **Actions**                                                     │
│ ┌──────────────────────────────────────────────────────┐       │
│ │  [✓ APPROVE]  [✗ REJECT]  [↺ REQUEST REVISION]       │       │
│ └──────────────────────────────────────────────────────┘       │
│                                                                 │
│ **Review Notes**                                                │
│ ┌──────────────────────────────────────────────────────┐       │
│ │ Add your review comments here...                     │       │
│ │                                                      │       │
│ │                                                      │       │
│ └──────────────────────────────────────────────────────┘       │
│                                                                 │
│ [Submit Review]                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Excel Import Interface (/admin/import) - NEW PAGE

```
┌─────────────────────────────────────────────────────────────────┐
│ BULK IMPORT CENTER                                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Step Progress Indicator]                                       │
│ ① Upload → ② Validate → ③ Review → ④ Complete                 │
│ ████████░░░░░░░░░░░░ 40%                                       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Step 1: Upload Zone]                                           │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │                                                          │   │
│ │  📁 Drag & Drop Excel file here                          │   │
│ │                                                          │   │
│ │              or                                          │   │
│ │                                                          │   │
│ │         [📂 Browse Files]                                │   │
│ │                                                          │   │
│ │  Supported: .xlsx, .xls, .csv (Max 10MB)                 │   │
│ │                                                          │   │
│ │  [📥 Download Import Template]                           │   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [Import Options]                                                │
│ ☑ Auto-approve valid products                                   │
│ ☑ Notify sellers on import completion                           │
│ ☐ Skip duplicates (update existing instead)                     │
│ ☑ Create moderation queue entries                               │
│                                                                 │
│ [🚀 Start Import]                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Step 2: Validation Results]                                    │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │                                                          │   │
│ │  ✅ 45 records passed validation                         │   │
│ │  ❌ 3 records failed                                     │   │
│ │                                                          │   │
│ │  **Errors:**                                             │   │
│ │  • Row 12: Missing seller_id                             │   │
│ │  • Row 28: Invalid price value "-50"                     │   │
│ │  • Row 35: Category "Fresh Fish" not recognized          │   │
│ │                                                          │   │
│ │  [📥 Download Error Report (.csv)]                       │   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│ [← Back] [Continue to Import →]                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Step 3: Import Progress]                                       │
│                                                                 │
│  Importing 45 records...                                       │
│  ████████████████░░░░ 80% (36/45 records processed)            │
│                                                                 │
│  [Processing details...]                                       │
│  ✓ PRD-001: Red Snapper - Success                              │
│  ✓ PRD-002: Bluefin Tuna - Success                             │
│  ⏳ PRD-003: King Crab - Processing...                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Step 4: Completion Summary]                                    │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │                                                          │   │
│ │  ✅ Import Complete!                                     │   │
│ │                                                          │   │
│ │  **Summary:**                                            │   │
│ │  • Total Records: 45                                     │   │
│ │  • Successful: 45                                        │   │
│ │  • Failed: 0                                             │   │
│ │  • Pending Moderation: 45                                │   │
│ │  • Auto-Approved: 0                                      │   │
│ │                                                          │   │
│ │  **Session ID:** IMP-1716556800-5678                     │   │
│ │  **Completed:** 2026-05-24 10:05:00                      │   │
│ │                                                          │   │
│ │  [📊 View Full Report] [🔄 Import Another] [👁 View Queue]│   │
│ │                                                          │   │
│ └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Import Sessions History (/admin/import/sessions) - NEW PAGE

```
┌─────────────────────────────────────────────────────────────────┐
│ IMPORT SESSIONS HISTORY                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Filter: Status [All ▼] | Date Range | 🔍 Search filename]     │
│                                                                 │
│ [Sessions Table]                                                │
│ ┌──────────────────┬────────┬──────┬─────────┬──────────┬─────┐│
│ │ Session ID       │ File   │Total │Success  │ Status   │Date ││
│ ├──────────────────┼────────┼──────┼─────────┼──────────┼─────┤│
│ │ IMP-1716556800-… │ may26… │  48  │   45    │ ✅ Done  │May24││
│ │ IMP-1716470400-… │ apr26… │ 120  │  118    │ ✅ Done  │May23││
│ │ IMP-1716384000-… │ test.… │  10  │    7    │ ❌ Fail  │May22││
│ └──────────────────┴────────┴──────┴─────────┴──────────┴─────┘│
│                                                                 │
│ [Pagination: ← 1 2 3 → | Showing 1-20 of 45 sessions]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Integration Strategy

### 1. API Response Filtering

**Current Behavior:**
- `/api/seller/products.php` returns ALL products regardless of moderation status

**Enhanced Behavior:**
```php
// In /api/seller/products.php
$is_admin = isset($_SERVER['HTTP_X_ADMIN_REQUEST']) && $_SERVER['HTTP_X_ADMIN_REQUEST'] === 'true';

if (!$is_admin) {
    // Public API - only return approved products
    $sql .= " AND (moderation_status = 'APPROVED' OR moderation_status IS NULL)";
    $sql .= " AND status = 'ACTIVE'";
}

// Admin API - return all products (handled by /api/admin/products.php)
```

### 2. Product Card Enhancement

**Add Moderation Status Badge:**

```tsx
// components/marketplace/ProductCard.tsx

const ModerationBadge = ({ status }: { status: string }) => {
  const config = {
    'APPROVED': { 
      color: 'bg-success', 
      icon: '✓', 
      text: 'Verified',
      show: false // Don't show on frontend for approved products
    },
    'PENDING': { 
      color: 'bg-warning animate-pulse', 
      icon: '⏳', 
      text: 'Reviewing',
      show: false // Hide pending products from frontend
    },
    'REJECTED': { 
      color: 'bg-danger', 
      icon: '✗', 
      text: 'Unavailable',
      show: false // Hide rejected products from frontend
    },
    'NEEDS_REVISION': { 
      color: 'bg-info', 
      icon: '↺', 
      text: 'Updating',
      show: false // Hide from frontend
    }
  }[status];
  
  if (!config || !config.show) return null;
  
  return (
    <Badge className={`${config.color} text-[7px] font-black uppercase italic rounded-full border-none px-2 py-1 text-white`}>
      {config.icon} {config.text}
    </Badge>
  );
};

// Filter products before rendering
const visibleProducts = products.filter(p => 
  p.moderation_status === 'APPROVED' || 
  p.moderation_status === null || 
  p.moderation_status === undefined
);
```

### 3. Product Detail Page Updates

**Handle Unavailable Products:**

```tsx
// /customer/products/[id]/page.tsx

if (product.moderation_status === 'REJECTED' || product.status === 'ARCHIVED') {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-6xl mb-4">🚫</div>
      <h2 className="text-2xl font-black uppercase italic mb-2">Product Unavailable</h2>
      <p className="text-sm text-text-secondary">This product is currently not available.</p>
      <Link href="/customer/products">
        <Button className="mt-4">Browse Other Products</Button>
      </Link>
    </div>
  );
}
```

### 4. Real-time Status Updates

**Implementation Options:**

1. **Polling (Simple):**
   ```tsx
   // Refresh product list every 30 seconds
   useEffect(() => {
     const interval = setInterval(() => {
       fetchLiveRegistry();
     }, 30000);
     return () => clearInterval(interval);
   }, []);
   ```

2. **WebSocket (Advanced - Future Enhancement):**
   ```tsx
   // Listen for moderation status changes
   const ws = new WebSocket('wss://oceanexotic.com/ws/moderation');
   ws.onmessage = (event) => {
     const update = JSON.parse(event.data);
     if (update.type === 'MODERATION_UPDATE') {
       fetchLiveRegistry(); // Refresh data
     }
   };
   ```

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1-2)

**Tasks:**
1. ✅ Create `product_moderation_queue` table
2. ✅ Create `product_moderation_log` table
3. ✅ Create `product_import_sessions` table
4. ✅ Add moderation fields to `products` table
5. ✅ Create database indexes for performance
6. ✅ Write migration script
7. ✅ Test migration on development database

**Deliverables:**
- SQL migration file
- Migration execution script
- Database documentation

### Phase 2: Backend API Development (Week 2-3)

**Tasks:**
1. ✅ Install PhpSpreadsheet via Composer
2. ✅ Enhance `/api/seller/products.php` with moderation filtering
3. ✅ Create `/api/admin/products.php` with full CRUD operations
4. ✅ Create `/api/admin/moderation.php` for workflow management
5. ✅ Create `/api/admin/import.php` for Excel processing
6. ✅ Create `/api/admin/products_bulk.php` for bulk operations
7. ✅ Implement validation logic
8. ✅ Write unit tests for all endpoints

**Deliverables:**
- 5 new/enhanced API endpoints
- PhpSpreadsheet integration
- API documentation
- Unit test suite

### Phase 3: Admin Interface Development (Week 3-4)

**Tasks:**
1. ✅ Update `/admin/products` page with moderation features
2. ✅ Create `/admin/moderation` page (new)
3. ✅ Create `/admin/import` page (new)
4. ✅ Create `/admin/import/sessions` page (new)
5. ✅ Enhance `/admin/products/add` with moderation indicators
6. ✅ Enhance `/admin/products/edit/[id]` with change history
7. ✅ Add product review modal with approve/reject actions
8. ✅ Implement bulk action functionality
9. ✅ Add import template download feature

**Deliverables:**
- 4 new admin pages
- Enhanced existing pages
- Review modal component
- Bulk action system

### Phase 4: Frontend Integration (Week 4)

**Tasks:**
1. ✅ Update product listing to filter by moderation_status
2. ✅ Add moderation badges to admin product cards
3. ✅ Handle rejected/unavailable products gracefully
4. ✅ Update product detail page
5. ✅ Implement real-time status polling
6. ✅ Test customer-facing display

**Deliverables:**
- Updated frontend components
- Filtered API responses
- Error handling for unavailable products

### Phase 5: Testing & Quality Assurance (Week 5)

**Tasks:**
1. ✅ Test Excel import with sample data (10, 50, 100 rows)
2. ✅ Test moderation workflow end-to-end
3. ✅ Test bulk operations (approve, reject, delete)
4. ✅ Test API response filtering
5. ✅ Load testing for large imports (500+ rows)
6. ✅ Cross-browser testing
7. ✅ Mobile responsiveness testing
8. ✅ Security testing (CSRF, SQL injection, file upload)

**Deliverables:**
- Test report
- Bug fixes
- Performance optimization report

### Phase 6: Documentation & Training (Week 5-6)

**Tasks:**
1. ✅ Write admin user guide
2. ✅ Create API documentation
3. ✅ Create import template guide
4. ✅ Write moderation workflow documentation
5. ✅ Create video tutorials (optional)
6. ✅ Conduct training session for admin users

**Deliverables:**
- User documentation
- API reference
- Training materials

---

## Technical Considerations

### Security

1. **CSRF Protection:**
   - Implement CSRF tokens for all admin POST/PUT/DELETE requests
   - Verify tokens server-side before processing

2. **File Upload Security:**
   - Validate file extensions (.xlsx, .xls, .csv only)
   - Check MIME types
   - Limit file size to 10MB
   - Scan for malicious content
   - Store uploads outside web root

3. **SQL Injection Prevention:**
   - Use parameterized queries (already implemented)
   - Validate all input data
   - Use PDO prepared statements

4. **Authentication & Authorization:**
   - Verify admin session before processing requests
   - Check admin permissions for moderation actions
   - Log all admin actions

5. **Rate Limiting:**
   - Limit import requests to 5 per minute per admin
   - Limit API requests to prevent abuse

### Performance

1. **Database Optimization:**
   - Add indexes on frequently queried fields
   - Use database views for complex queries
   - Implement query caching

2. **API Response Caching:**
   - Cache approved products list (5-minute TTL)
   - Cache moderation queue stats (1-minute TTL)
   - Use Redis for distributed caching (future)

3. **Excel Import Processing:**
   - Process imports in chunks (100 rows per batch)
   - Use async processing for large files (500+ rows)
   - Show real-time progress updates
   - Implement rollback on failure

4. **Image Optimization:**
   - Compress uploaded images
   - Generate thumbnails for product listings
   - Use CDN for image delivery (future)

### Data Integrity

1. **Transaction Management:**
   - Use database transactions for import operations
   - Rollback on any failure
   - Log all transaction states

2. **Soft Deletes:**
   - Use status='ARCHIVED' instead of DELETE
   - Maintain audit trail
   - Allow recovery of deleted products

3. **Audit Logging:**
   - Log all product changes
   - Track who made changes and when
   - Store previous and new states

4. **Backup Strategy:**
   - Create backup before bulk operations
   - Implement automated daily backups
   - Test restore procedures

### Error Handling

1. **User-Friendly Messages:**
   - Show clear error messages with row numbers for import failures
   - Provide actionable feedback for moderation rejections
   - Log detailed errors for debugging

2. **Graceful Degradation:**
   - Show cached data if API fails
   - Retry failed imports automatically
   - Notify admins of system issues

---

## Critical Discoveries from Field Analysis

1. **Status Field is VARCHAR, not ENUM**
   - Contains mixed values from different parts of the system
   - Values: ACTIVE, OUT_OF_STOCK, ARCHIVED, PUBLISHED, PENDING AUDIT
   - **Recommendation:** Keep as VARCHAR, use `moderation_status` for workflow

2. **Gallery and Nutrition stored as LONGTEXT JSON**
   - Requires proper JSON parsing in API
   - Must handle both string and parsed formats
   - **Recommendation:** Create helper functions for JSON encode/decode

3. **No min_order field in database**
   - Used in admin forms but missing from schema
   - **Recommendation:** Add to ALTER TABLE script

4. **Product IDs are mixed format**
   - Some use: PRD-AND-01, PRD-SM-001
   - Others use: surmai-seer-fish, bangda-mackerel
   - **Recommendation:** Standardize to PRD-{CATEGORY}-{NUMBER} format

5. **Seller IDs format**
   - Format: SEL-USR-timestamp
   - Example: SEL-USR-1778761853233
   - **Recommendation:** Document and enforce format

6. **Excel.js already in node_modules**
   - Can use for frontend Excel generation
   - **Recommendation:** Use for template download feature

7. **PhpSpreadsheet needed for backend**
   - Must install via Composer
   - **Recommendation:** Add to composer.json

---

## Authorization Checklist

Before proceeding with implementation, please confirm:

### Database Changes
- [ ] Approval to create 3 new tables (moderation_queue, moderation_log, import_sessions)
- [ ] Approval to add 7 new columns to products table
- [ ] Approval to run migration script on production database

### Backend Development
- [ ] Approval to install PhpSpreadsheet via Composer
- [ ] Approval to create 5 new API endpoints
- [ ] Approval to modify existing `/api/seller/products.php` endpoint

### Frontend Development
- [ ] Approval to create 4 new admin pages
- [ ] Approval to modify existing admin product pages
- [ ] Approval to update customer-facing product filtering

### Data Migration
- [ ] Approval to set existing products to moderation_status='APPROVED' by default
- [ ] Approval to create moderation queue entries for products with status='PENDING AUDIT'

### Go-Live
- [ ] Approval to deploy to production after testing
- [ ] Approval to notify sellers about new moderation workflow
- [ ] Approval to provide training to admin users

---

## Next Steps

1. **Review this blueprint** - Read through all sections carefully
2. **Provide feedback** - Note any changes or additions needed
3. **Grant authorization** - Check off items in the Authorization Checklist
4. **Implementation begins** - We start with Phase 1 (Database Foundation)

**Estimated Timeline:** 5-6 weeks for complete implementation

**Estimated Effort:** 
- Database: 2-3 days
- Backend API: 5-7 days
- Admin UI: 7-10 days
- Frontend Integration: 3-5 days
- Testing: 5-7 days
- Documentation: 2-3 days

---

**Document Prepared By:** AI Development Assistant  
**Date:** May 24, 2026  
**Version:** 1.0  
**Status:** ⏳ Awaiting Authorization

---

*End of Blueprint Document*
