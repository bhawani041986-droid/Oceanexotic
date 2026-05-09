txt id="q4v7mz"
Create COMPLETE detailed page-by-page layouts for a production-ready Online Fish Selling SaaS Platform.

The platform contains:
1. Admin Panel
2. Seller Dashboard
3. Customer Marketplace App

IMPORTANT:
Generate COMPLETE screen layouts with exact component hierarchy and positioning.
DO NOT generate generic layouts.
Every page must feel like a real production SaaS application.

Maintain ONE strict design system across ALL pages.

====================================================
GLOBAL LAYOUT RULES
====================================================

APP FRAMEWORK:
- Fixed left sidebar
- Sticky top navbar
- Responsive mobile sidebar
- 12-column responsive grid
- Dark mode first
- Tailwind-compatible structure
- Reusable components only

SIDEBAR:
Width:
- Desktop: 260px
- Tablet: 88px collapsed
- Mobile: hidden drawer

TOP NAVBAR:
Height:
- 72px

Contains:
- Search bar
- Notifications
- Messages
- User profile dropdown
- Theme toggle
- Breadcrumbs

MAIN CONTENT:
- Max width container
- Consistent spacing
- 32px section gaps
- 24px card padding

====================================================
AUTHENTICATION PAGES
====================================================

-----------------------------------
LOGIN PAGE LAYOUT
-----------------------------------

LEFT SECTION:
- Brand logo
- Fish marketplace illustration
- Welcome headline
- Supporting text
- Ocean-inspired gradient background

RIGHT SECTION:
Centered auth card containing:
- Email input
- Password input
- Remember me checkbox
- Forgot password link
- Login button
- Social login buttons
- Register redirect
- Terms text

CARD STYLE:
- Width: 420px
- Radius: 20px
- Soft shadow
- Dark glassmorphism effect

-----------------------------------
REGISTER PAGE LAYOUT
-----------------------------------

Top:
- Logo
- Welcome title

Middle:
Multi-step registration form:
STEP 1:
- Name
- Email
- Phone

STEP 2:
- Password
- Confirm password

STEP 3:
- Address
- Business details (seller only)

Bottom:
- Submit button
- Login redirect

-----------------------------------
FORGOT PASSWORD PAGE
-----------------------------------

Centered card:
- Email input
- Send OTP button
- Back to login

-----------------------------------
OTP VERIFICATION PAGE
-----------------------------------

Centered OTP card:
- 6 OTP inputs
- Countdown timer
- Resend button
- Verify button

-----------------------------------
RESET PASSWORD PAGE
-----------------------------------

Centered form:
- New password
- Confirm password
- Password strength meter
- Reset button

====================================================
ADMIN PANEL LAYOUTS
====================================================

-----------------------------------
ADMIN DASHBOARD
-----------------------------------

TOP SECTION:
- Welcome message
- Date selector
- Quick action buttons

ROW 1:
4 analytics cards:
- Total Revenue
- Total Orders
- Active Sellers
- Pending Deliveries

ROW 2:
LEFT:
- Revenue graph
- Monthly sales chart

RIGHT:
- Recent activity feed
- Notifications panel

ROW 3:
LEFT:
- Orders table

RIGHT:
- Fish inventory alerts
- Top-selling fish

BOTTOM:
- Seller performance table
- Customer growth chart

-----------------------------------
SELLER MANAGEMENT PAGE
-----------------------------------

TOP:
- Page title
- Add seller button
- Export button

FILTER ROW:
- Search
- Status filter
- Region filter
- Date filter

MAIN:
Responsive seller table:
Columns:
- Seller profile
- Store name
- Rating
- Revenue
- Status
- Actions

RIGHT DRAWER:
Seller profile modal:
- Business info
- KYC docs
- Analytics
- Reviews
- Approve/reject buttons

-----------------------------------
PRODUCT MANAGEMENT PAGE
-----------------------------------

TOP:
- Add fish button
- Bulk upload
- Category filter

LEFT SIDEBAR FILTERS:
- Fish category
- Price range
- Availability
- Seller

MAIN GRID:
Fish product cards:
- Fish image
- Freshness badge
- Stock indicator
- Price
- Seller
- Quick actions

MODAL:
Add/Edit fish form:
- Upload image
- Fish name
- Category
- Price
- Weight
- Freshness duration
- Inventory count

-----------------------------------
ORDER MANAGEMENT PAGE
-----------------------------------

TOP:
- Search
- Filters
- Export

MAIN:
Orders table:
- Order ID
- Customer
- Seller
- Fish items
- Status
- Payment
- Delivery progress

RIGHT PANEL:
Live delivery tracker:
- Timeline
- Delivery status
- Rider info

-----------------------------------
REVIEW MODERATION PAGE
-----------------------------------

TOP:
- Review analytics
- Average ratings

LEFT:
Review list cards:
- User profile
- Review content
- Rating
- Uploaded photos
- Helpful count

RIGHT:
Moderation panel:
- Approve
- Reject
- Mark spam
- AI moderation alerts

====================================================
SELLER DASHBOARD LAYOUTS
====================================================

-----------------------------------
SELLER DASHBOARD
-----------------------------------

TOP:
- Welcome seller message
- Store performance summary

ROW 1:
Stats cards:
- Earnings
- Orders
- Inventory
- Customer ratings

ROW 2:
LEFT:
Sales analytics chart

RIGHT:
Inventory alerts

ROW 3:
- Recent orders table
- Customer review feed

BOTTOM:
Quick actions:
- Add fish
- Create promotion
- Manage inventory

-----------------------------------
ADD FISH LISTING PAGE
-----------------------------------

LEFT:
Image upload zone

RIGHT:
Fish details form:
- Name
- Category
- Description
- Price
- Weight
- Delivery availability
- Freshness duration

BOTTOM:
- SEO tags
- Save draft
- Publish button

-----------------------------------
SELLER REVIEWS PAGE
-----------------------------------

TOP:
- Average rating
- Rating graph
- Review statistics

MAIN:
Review cards:
- Customer image
- Rating
- Review text
- Uploaded photos
- Reply button

RIGHT:
Review filters

====================================================
CUSTOMER APP LAYOUTS
====================================================

-----------------------------------
CUSTOMER HOME PAGE
-----------------------------------

TOP HERO:
- Large promotional banner
- Search bar
- CTA buttons

SECTION 1:
Fish categories carousel

SECTION 2:
Featured fish products grid

SECTION 3:
Fresh arrivals carousel

SECTION 4:
Popular sellers

SECTION 5:
Promotional offers

BOTTOM:
Newsletter signup
Footer links

-----------------------------------
PRODUCT LISTING PAGE
-----------------------------------

LEFT SIDEBAR:
Filters:
- Category
- Price
- Seller rating
- Delivery time
- Freshness level

TOP:
- Search
- Sort dropdown
- Grid/list toggle

MAIN:
Responsive product grid:
Each card contains:
- Fish image
- Freshness badge
- Seller info
- Rating
- Price
- Delivery ETA
- Add to cart button

-----------------------------------
PRODUCT DETAILS PAGE
-----------------------------------

LEFT:
Large image gallery

CENTER:
- Product title
- Seller
- Rating
- Freshness details
- Pricing
- Quantity selector
- Add to cart
- Buy now

RIGHT:
Delivery info card:
- ETA
- Cold-chain badge
- Return policy

BOTTOM TABS:
- Description
- Nutrition
- Reviews
- Seller info

-----------------------------------
SHOPPING CART PAGE
-----------------------------------

LEFT:
Cart item cards:
- Product image
- Quantity controls
- Price
- Remove button

RIGHT:
Order summary:
- Subtotal
- Delivery fee
- Discount
- Total
- Checkout button

-----------------------------------
CHECKOUT PAGE
-----------------------------------

STEP 1:
Address selection

STEP 2:
Delivery method

STEP 3:
Payment method

STEP 4:
Order summary

RIGHT:
Sticky summary card

-----------------------------------
ORDER TRACKING PAGE
-----------------------------------

TOP:
Order summary card

CENTER:
Live delivery tracker timeline:
- Confirmed
- Packed
- In transit
- Delivered

MAP SECTION:
Delivery route visualization

BOTTOM:
Chat with seller/delivery

-----------------------------------
CUSTOMER REVIEWS PAGE
-----------------------------------

TOP:
Review summary:
- Average rating
- Rating bars
- Total reviews

LEFT:
Review feed

RIGHT:
Review filters:
- Star filter
- Verified purchase
- With images

BOTTOM:
Write review section

-----------------------------------
WRITE REVIEW PAGE
-----------------------------------

TOP:
Product preview

MIDDLE:
Review form:
- Star rating
- Text review
- Upload images/videos
- Freshness rating
- Delivery experience

BOTTOM:
Submit review button

====================================================
SETTINGS PAGES
====================================================

-----------------------------------
SETTINGS PAGE
-----------------------------------

LEFT:
Settings navigation

RIGHT:
Settings panels:
- Profile
- Notifications
- Security
- Payments
- Preferences

====================================================
ERROR & SYSTEM PAGES
====================================================

-----------------------------------
404 PAGE
-----------------------------------

CENTER:
- Large 404 illustration
- Message
- Return home button

-----------------------------------
500 ERROR PAGE
-----------------------------------

CENTER:
- Error illustration
- Retry button
- Support contact

-----------------------------------
EMPTY STATES
-----------------------------------

Centered minimal layout:
- Illustration
- Message
- CTA button

====================================================
MOBILE RESPONSIVE RULES
====================================================

MOBILE CUSTOMER APP:
- Bottom navigation
- Sticky add-to-cart
- Swipe product cards
- Mobile checkout flow

MOBILE DASHBOARDS:
- Collapsible sidebar
- Stack cards vertically
- Responsive charts
- Scrollable tables

====================================================
FINAL INSTRUCTIONS
====================================================

IMPORTANT:
Generate ALL pages together.

Maintain:
- EXACT same spacing
- EXACT same typography
- EXACT same buttons
- EXACT same card design
- EXACT same input design
- EXACT same navbar/sidebar
- EXACT same shadow system

DO NOT:
- Redesign pages individually
- Change colors randomly
- Change border radius
- Use inconsistent layouts

ALL pages must feel like ONE premium SaaS product built by the same design team.
