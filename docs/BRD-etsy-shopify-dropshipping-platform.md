# BRD - Etsy & Shopify Dropshipping Automation Platform

## Business Requirements Document

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Draft
**Project Code:** ETSY-SHOP-AUTO

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Scope](#3-scope)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Module 1: Etsy Store Factory](#5-module-1-etsy-store-factory)
6. [Module 2: Shopify Mirror Generator](#6-module-2-shopify-mirror-generator)
7. [Module 3: POD Integration Layer](#7-module-3-pod-integration-layer)
8. [Module 4: Central Management Dashboard](#8-module-4-central-management-dashboard)
9. [Module 5: Sales Acceleration Engine](#9-module-5-sales-acceleration-engine)
10. [Module 6: Account Holders & Torah Fund Management](#10-module-6-account-holders--torah-fund-management)
11. [Etsy Limitations & Mitigation Strategies](#11-etsy-limitations--mitigation-strategies)
12. [Technical Requirements](#12-technical-requirements)
13. [Data Model](#13-data-model)
14. [API Integrations](#14-api-integrations)
15. [Security & Compliance](#15-security--compliance)
16. [Revenue Model & Commission Structure](#16-revenue-model--commission-structure)
17. [Risk Assessment](#17-risk-assessment)
18. [Rollout Phases](#18-rollout-phases)
19. [Success Metrics / KPIs](#19-success-metrics--kpis)
20. [Glossary](#20-glossary)

---

## 1. Executive Summary

This document defines the business requirements for a sophisticated e-commerce automation platform that operates at scale across **Etsy** and **Shopify** marketplaces. The platform will:

- Generate and manage **thousands of Etsy stores** registered under identities of **Account Holders from the Haredi (ultra-Orthodox) community in Israel** - fully automated, no active management by Account Holders
- Create **mirror Shopify stores** that replicate Etsy product catalogs for multi-channel presence
- Integrate with **Print-on-Demand (POD)** suppliers for zero-inventory fulfillment
- Provide a **centralized dashboard** for Admin to manage all stores, orders, finances, and Account Holders
- Deploy a **sales acceleration engine** using SEO, ad automation, and pricing intelligence

The platform must handle Etsy's inherent limitations (rate limits, account verification, listing caps) through sophisticated orchestration and distributed account management.

---

## 2. Business Objectives

| # | Objective | Target |
|---|-----------|--------|
| BO-1 | Scale Etsy store operations to thousands of active stores | 1,000+ stores in Year 1 |
| BO-2 | Mirror each Etsy store as a Shopify storefront | 1:1 parity with Etsy catalog |
| BO-3 | Automate product listing, pricing, and order fulfillment | 95%+ automation rate |
| BO-4 | Centralize management of all stores in a single dashboard | Single pane of glass |
| BO-5 | Manage Account Holders with automated Torah fund payouts | 5% of sales to Torah fund |
| BO-6 | Maximize revenue per store via sales acceleration tools | 20% MoM growth target |
| BO-7 | Minimize Etsy account suspension risk | <2% suspension rate |

---

## 3. Scope

### 3.1 In Scope

- Etsy store creation and lifecycle management
- Shopify store generation and sync from Etsy
- POD provider integration (Printful, Printify, Gooten, SPOD)
- Centralized multi-store dashboard
- Account Holder identity management and Torah fund payout system
- Sales acceleration (SEO, ads, pricing)
- Order routing and fulfillment automation
- Financial reporting and analytics
- Etsy anti-detection and compliance layer

### 3.2 Out of Scope

- Physical inventory management
- Non-POD product sourcing
- Marketplaces beyond Etsy and Shopify (Amazon, eBay - future phase)
- Customer service chatbot (future phase)
- Mobile native app (web responsive only)

---

## 4. System Architecture Overview

```
+------------------------------------------------------+
|              CENTRAL MANAGEMENT DASHBOARD             |
|  (Next.js / React / TypeScript)                       |
+------------------------------------------------------+
        |            |            |            |
   +--------+  +--------+  +--------+  +--------+
   | Store  |  |  POD   |  | Sales  |  | Acct   |
   | Factory|  | Engine |  | Accel  |  | Holder |
   +--------+  +--------+  +--------+  +--------+
        |            |            |            |
+------------------------------------------------------+
|              ORCHESTRATION LAYER                      |
|  (Queue System / Job Scheduler / Rate Limiter)        |
+------------------------------------------------------+
        |            |            |            |
   +--------+  +--------+  +--------+  +--------+
   |  Etsy  |  |Shopify |  |  POD   |  |Payment |
   |  API   |  |  API   |  |  APIs  |  |  APIs  |
   +--------+  +--------+  +--------+  +--------+
```

---

## 5. Module 1: Etsy Store Factory

### 5.1 Purpose
Automated creation and management of thousands of Etsy stores, each registered under a contracted VA's identity.

### 5.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SF-001 | Guided Etsy store creation workflow with step-by-step instructions for VAs | P0 |
| SF-002 | Store identity management - unique branding, logo, banner per store | P0 |
| SF-003 | Niche assignment engine - assign each store a specific niche/vertical | P0 |
| SF-004 | Automated product listing upload via Etsy API (with rate limiting) | P0 |
| SF-005 | Listing variation management (sizes, colors, materials) | P1 |
| SF-006 | SEO-optimized title and tag generation per listing | P0 |
| SF-007 | Store health monitoring (reviews, star rating, policy violations) | P0 |
| SF-008 | Automated store policy and About page generation | P1 |
| SF-009 | Store warm-up protocol (gradual listing increase to avoid flags) | P0 |
| SF-010 | Bulk listing tools with CSV/JSON import | P1 |
| SF-011 | Niche research tool with trending product identification | P1 |
| SF-012 | Store cloning capability (replicate successful store templates) | P2 |

### 5.3 Store Warm-up Protocol

To avoid Etsy suspensions on new stores, the system must implement:

```
Week 1:  5-10 listings   | Basic store setup | Manual-like behavior
Week 2:  15-25 listings  | Add store policies | First marketing push
Week 3:  30-50 listings  | Optimize tags/SEO | Enable ads
Week 4:  50-100 listings | Full catalog push  | Scale operations
Week 5+: Up to 500/store | Continuous optimization
```

### 5.4 Store Identity Generation

Each store requires:
- Unique store name (generated via niche + style algorithm)
- Custom logo (AI-generated or template-based)
- Custom banner image
- Unique "About" story (AI-generated, localized)
- Distinct IP/browser fingerprint rotation per session

---

## 6. Module 2: Shopify Mirror Generator

### 6.1 Purpose
For every Etsy store, automatically generate a corresponding Shopify storefront that mirrors the product catalog, providing a secondary sales channel and brand presence.

### 6.2 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SM-001 | Auto-create Shopify store per Etsy store (via Shopify Partners API) | P0 |
| SM-002 | Bi-directional product sync (Etsy <-> Shopify) | P0 |
| SM-003 | Automatic theme selection and customization per niche | P1 |
| SM-004 | Custom domain assignment and DNS management | P1 |
| SM-005 | Shopify payment gateway auto-configuration | P0 |
| SM-006 | Inventory sync (POD availability reflected on both platforms) | P0 |
| SM-007 | Price differential management (Shopify can have different pricing) | P1 |
| SM-008 | Shopify SEO meta tags auto-generation | P1 |
| SM-009 | Shopify app auto-installation (reviews, upsell, email capture) | P2 |
| SM-010 | Shopify store template library (10+ niche-specific themes) | P1 |

### 6.3 Sync Architecture

```
ETSY STORE                    SHOPIFY MIRROR
+-----------+                 +-----------+
| Listing A |  -- sync -->    | Product A |
| Listing B |  -- sync -->    | Product B |
| Listing C |  -- sync -->    | Product C |
+-----------+                 +-----------+
      |                             |
      v                             v
+-------------------------------------------+
|        UNIFIED ORDER MANAGEMENT           |
|   (Orders from both channels merged)      |
+-------------------------------------------+
              |
              v
       +-------------+
       |  POD ROUTER |
       +-------------+
```

---

## 7. Module 3: POD Integration Layer

### 7.1 Purpose
Connect all stores to Print-on-Demand providers for zero-inventory fulfillment with automatic order routing.

### 7.2 Supported POD Providers

| Provider | Products | Priority | Avg. Production Time |
|----------|----------|----------|---------------------|
| Printful | Apparel, Home & Living, Accessories | P0 | 2-5 business days |
| Printify | Apparel, Home, Office, Accessories | P0 | 2-7 business days |
| Gooten | Apparel, Home, Photo products | P1 | 3-8 business days |
| SPOD | Apparel (fast production) | P1 | 48 hours |
| CustomCat | Apparel, Mugs, Phone cases | P2 | 2-4 business days |

### 7.3 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| POD-001 | Multi-provider product catalog aggregation | P0 |
| POD-002 | Smart order routing (cheapest/fastest/closest to customer) | P0 |
| POD-003 | Design file management and template system | P0 |
| POD-004 | Mockup generation for product listings | P0 |
| POD-005 | Automatic order forwarding from Etsy/Shopify to POD | P0 |
| POD-006 | Shipment tracking sync back to marketplace | P0 |
| POD-007 | Quality control - sample ordering system | P1 |
| POD-008 | Cost calculator with margin analysis per product | P0 |
| POD-009 | Fallback routing if primary POD provider is out of stock | P1 |
| POD-010 | Design AI integration for auto-generating designs | P2 |

### 7.4 Order Flow

```
Customer Order (Etsy/Shopify)
        |
        v
  Order Ingestion
        |
        v
  POD Router (select best provider)
        |
        v
  Design File Attachment
        |
        v
  Submit to POD Provider API
        |
        v
  Production & Shipping
        |
        v
  Tracking # Sync to Marketplace
        |
        v
  Customer Delivery
        |
        v
  Review Request Automation
```

---

## 8. Module 4: Central Management Dashboard

### 8.1 Purpose
A single dashboard to manage all Etsy stores, Shopify mirrors, orders, finances, VAs, and analytics.

### 8.2 Dashboard Sections

#### 8.2.1 Store Overview

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-001 | Grid/list view of all stores with status indicators | P0 |
| DB-002 | Store health score (composite of reviews, sales, compliance) | P0 |
| DB-003 | Quick actions: pause store, add listings, view analytics | P0 |
| DB-004 | Store grouping by niche, VA, performance tier | P1 |
| DB-005 | Store search and advanced filtering | P0 |
| DB-006 | Store creation wizard launch | P0 |

#### 8.2.2 Order Management

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-010 | Unified order feed from all Etsy + Shopify stores | P0 |
| DB-011 | Order status tracking (pending, production, shipped, delivered) | P0 |
| DB-012 | Bulk order actions (fulfill, cancel, refund) | P0 |
| DB-013 | Order issue flagging and resolution workflow | P1 |
| DB-014 | Returns and disputes management | P1 |
| DB-015 | Order timeline with full event history | P1 |

#### 8.2.3 Financial Dashboard

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-020 | Revenue by store, niche, time period | P0 |
| DB-021 | Profit margin calculator (revenue - POD cost - fees - Account Holder 5%) | P0 |
| DB-022 | Etsy + Shopify fee tracking | P0 |
| DB-023 | Account Holder Torah fund calculation and payout tracking | P0 |
| DB-024 | Cash flow forecasting | P2 |
| DB-025 | Tax reporting exports | P1 |
| DB-026 | Multi-currency support (USD, ILS for VA payouts) | P1 |

#### 8.2.4 Analytics & Reports

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-030 | Sales trends (daily, weekly, monthly) per store and aggregate | P0 |
| DB-031 | Best-selling products and niches | P0 |
| DB-032 | Conversion rate tracking per store and listing | P0 |
| DB-033 | Traffic source analysis | P1 |
| DB-034 | Customer demographics and geography | P2 |
| DB-035 | Competitor analysis dashboard | P2 |
| DB-036 | Custom report builder | P2 |

#### 8.2.5 Notification Center

| ID | Requirement | Priority |
|----|-------------|----------|
| DB-040 | Real-time alerts for store suspensions/warnings | P0 |
| DB-041 | Order issue notifications | P0 |
| DB-042 | Account Holder payout alerts | P1 |
| DB-043 | Sales milestone notifications | P2 |
| DB-044 | Configurable notification channels (email, Slack, Telegram, SMS) | P1 |

---

## 9. Module 5: Sales Acceleration Engine

### 9.1 Purpose
Maximize revenue across all stores through automated marketing, SEO optimization, and pricing intelligence.

### 9.2 Functional Requirements

#### 9.2.1 Etsy SEO Engine

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-001 | Keyword research tool (Etsy-specific search data) | P0 |
| SA-002 | Automated tag optimization (13 tags per listing) | P0 |
| SA-003 | Title optimization with primary keyword placement | P0 |
| SA-004 | Listing description SEO templates | P1 |
| SA-005 | Category and attribute optimization | P0 |
| SA-006 | Seasonal keyword scheduling (holidays, events) | P1 |

#### 9.2.2 Etsy Ads Management

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-010 | Automated Etsy Ads campaign creation per store | P0 |
| SA-011 | Budget allocation algorithm (based on ROI per store) | P0 |
| SA-012 | Bid optimization with daily adjustment | P1 |
| SA-013 | Underperforming ad auto-pause | P0 |
| SA-014 | Ad spend tracking and ROAS reporting | P0 |

#### 9.2.3 Pricing Intelligence

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-020 | Competitor price monitoring | P1 |
| SA-021 | Dynamic pricing rules (floor price, ceiling, margin target) | P1 |
| SA-022 | Sale/coupon automation (Etsy sales events) | P1 |
| SA-023 | Bundle pricing suggestions | P2 |

#### 9.2.4 Social & External Traffic

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-030 | Pinterest auto-posting from product images | P1 |
| SA-031 | Instagram/TikTok content generation suggestions | P2 |
| SA-032 | Google Shopping feed generation for Shopify stores | P1 |
| SA-033 | Email marketing automation (Shopify customer capture) | P2 |
| SA-034 | Etsy Share & Save discount automation | P1 |

---

## 10. Module 6: Account Holders & Torah Fund Management

### 10.1 Purpose
Manage **Account Holders** from the Haredi (ultra-Orthodox) community in Israel who provide their identity (name, ID, address) for Etsy store registration. Account Holders have a **passive role** - they do NOT manage stores. All store operations are fully automated and managed by the Admin through the platform. In return, Account Holders receive **5% of sales as a Torah study fund (מעשר לתורה)**.

### 10.2 Key Concept: Passive Identity Model

```
ACCOUNT HOLDER (Haredi)              ADMIN / PLATFORM
+---------------------------+        +---------------------------+
| Provides:                 |        | Manages:                  |
|  - Full name              |        |  - Store creation          |
|  - Teudat Zehut (ID)     |        |  - Product listings        |
|  - Address                |        |  - SEO & marketing         |
|  - Phone number           |        |  - Order fulfillment       |
|  - Bank details           |        |  - Customer service        |
|                           |        |  - Ads & pricing           |
| Receives:                 |        |  - ALL operations          |
|  - 5% of sales            |        |                           |
|    (Torah study fund)     |        | 100% AUTOMATED             |
+---------------------------+        +---------------------------+
```

**The Account Holder does NOT:**
- Log in to Etsy or manage the store
- Handle orders, customers, or listings
- Make business decisions
- Perform any daily tasks

**The Account Holder ONLY:**
- Provides identity for store registration
- Receives 5% payout for Torah study support
- May need to verify identity (one-time, during onboarding)

### 10.3 Account Holder Lifecycle

```
RECRUITMENT --> ONBOARDING --> IDENTITY REGISTERED --> PASSIVE (receiving payouts)
     |              |                |                        |
     v              v                v                        v
  Community    KYC/Identity    Store Created Under      Monthly 5% payout
  Referral     Verification    Their Name (by Admin)    to bank/Bit
```

### 10.4 Account Holder Characteristics

| Aspect | Details |
|--------|---------|
| Location | Israel (primarily Bnei Brak, Jerusalem, Beit Shemesh, Modi'in Illit, Beitar Illit) |
| Role | Passive - identity provider only |
| Involvement | One-time onboarding, then passive income |
| Recruitment | Community referrals, Kolel networks, Haredi employment orgs |
| Payment | Israeli bank transfer (primary), Bit app, PayBox, PayPal |
| Currency | ILS (Israeli New Shekel) |
| Motivation | Supporting Torah study through passive income |

### 10.5 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| AH-001 | Account Holder profile management (name, ID, address, bank details) | P0 |
| AH-002 | Store-to-Account Holder identity mapping (multiple stores per person) | P0 |
| AH-003 | Automated commission calculation (5% of gross sale per store) | P0 |
| AH-004 | Commission payout scheduling (monthly) | P0 |
| AH-005 | Israeli bank transfer / Bit app / PayPal payout integration | P0 |
| AH-006 | One-time identity verification (Teudat Zehut + selfie) | P0 |
| AH-007 | Agreement digital signing (Hebrew + English) | P0 |
| AH-008 | Payout history and transparency dashboard (simple, read-only) | P1 |
| AH-009 | Maximum stores per Account Holder limit (configurable, default: 5) | P0 |
| AH-010 | Account Holder status tracking (active, paused, terminated) | P0 |
| AH-011 | Automated payout reports (monthly summary in Hebrew) | P1 |

### 10.6 Commission Structure (5% Torah Fund)

```
SALE EVENT:
  Customer pays:        $35.00
  Etsy fees:            -$5.25 (15%)
  POD cost:             -$12.00
  Etsy Ads (if used):   -$2.00
  --------------------------------
  Gross Margin:         $15.75

  Account Holder Torah Fund (5% of sale price): $1.75
  Net Profit:           $14.00
```

### 10.7 Payout Rules

- Minimum payout threshold: ₪200 / $50 (accumulated)
- Payout frequency: Monthly (1st of each month), never on Shabbat/holidays
- Currency: ILS (converted from USD at daily rate)
- Payment methods: Israeli bank transfer (primary), Bit app, PayBox, PayPal
- Payout disputes: 7-day resolution window
- Returns/refunds: Commission clawed back if order refunded within 30 days

### 10.8 Shabbat & Holiday Compliance

- **No payout processing** on Shabbat or Jewish holidays
- **Notifications** queued and delivered after Shabbat/holiday ends
- **Store operations** continue fully automatically 24/7 (no Account Holder involvement needed)
- **Onboarding meetings** never scheduled on Shabbat or Jewish holidays

### 10.9 Full Automation - Admin Managed

Since Account Holders are passive, ALL store operations are handled by the Admin through:
- **Automated product listing** via AI + Etsy API
- **Automated order routing** to POD providers
- **Automated pricing & SEO** optimization
- **Automated ad management** (Etsy Ads)
- **Automated customer service** responses
- **Automated tracking updates** to customers
- **Anti-detect browser profiles** managed centrally by Admin
- **Proxy rotation** managed centrally - no Account Holder login needed

---

## 11. Etsy Limitations & Mitigation Strategies

### 11.1 Known Etsy Restrictions

| Limitation | Details | Risk Level |
|------------|---------|------------|
| Account verification | Phone, ID, bank verification required | HIGH |
| IP tracking | Same IP across accounts triggers flags | CRITICAL |
| Listing limits | New stores limited; gradual increase needed | MEDIUM |
| API rate limits | Varies by endpoint; ~5,000 requests/day | HIGH |
| Payment hold | New stores have 3-day to 45-day payment reserve | MEDIUM |
| Digital fingerprinting | Browser fingerprint, device ID tracking | HIGH |
| Star seller requirements | Shipping, messages, reviews thresholds | MEDIUM |
| Linked account detection | Shared payment, address, IP triggers linking | CRITICAL |

### 11.2 Mitigation Strategies

#### 11.2.1 Account Isolation

| ID | Strategy | Implementation |
|----|----------|---------------|
| MIT-001 | Unique IP per store session | Residential proxy rotation (Israeli IPs for VAs) |
| MIT-002 | Unique browser fingerprint | Anti-detect browser profiles (GoLogin/Multilogin) |
| MIT-003 | Unique payment methods | Each VA uses their own bank/PayPal |
| MIT-004 | Unique physical addresses | VA home addresses for verification |
| MIT-005 | Unique phone numbers | Israeli SIM cards per VA |
| MIT-006 | Unique email accounts | Separate email per store |
| MIT-007 | No shared WiFi networks | VAs work from different locations/ISPs across Israel |

#### 11.2.2 API Rate Limit Management

| ID | Strategy | Implementation |
|----|----------|---------------|
| MIT-010 | Request throttling | Intelligent queue with per-store rate tracking |
| MIT-011 | Request batching | Combine multiple operations where possible |
| MIT-012 | Off-peak scheduling | Heavy operations during low-traffic hours |
| MIT-013 | Caching layer | Cache frequently accessed data to reduce API calls |
| MIT-014 | Webhook utilization | Use Etsy webhooks instead of polling where available |

#### 11.2.3 Anti-Suspension Protocol

| ID | Strategy | Implementation |
|----|----------|---------------|
| MIT-020 | Gradual ramp-up | Follow warm-up protocol strictly (see 5.3) |
| MIT-021 | Human-like behavior | Random delays, varied login times, organic patterns |
| MIT-022 | Policy compliance | Auto-check listings against Etsy policies before publish |
| MIT-023 | Review management | Auto-respond to reviews, prioritize issue resolution |
| MIT-024 | Suspension early detection | Monitor store health metrics, alert on anomalies |
| MIT-025 | Appeal automation | Pre-written appeal templates, quick VA response workflow |

---

## 12. Technical Requirements

### 12.1 Technology Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Frontend | Next.js 14 + React 18 + TypeScript | Already in place; SSR for dashboard |
| UI Framework | Tailwind CSS + shadcn/ui | Rapid UI development |
| State Management | Zustand / React Query | Lightweight, server-state focused |
| Backend | Node.js + Express / Next.js API Routes | JavaScript ecosystem consistency |
| Database | PostgreSQL (primary) + Redis (cache/queue) | Relational data + high-performance cache |
| ORM | Prisma | Type-safe database access |
| Job Queue | BullMQ (Redis-backed) | Reliable job processing with retries |
| Authentication | NextAuth.js + RBAC | Multi-role auth (Admin, Manager, Viewer) |
| File Storage | AWS S3 / Cloudflare R2 | Design files, mockups, exports |
| Hosting | Vercel (frontend) + Railway/AWS (backend) | Scalable deployment |
| Monitoring | Sentry + Datadog | Error tracking + performance |
| CI/CD | GitHub Actions | Automated testing and deployment |

### 12.2 Infrastructure Requirements

| Requirement | Specification |
|-------------|---------------|
| Uptime SLA | 99.9% |
| Max API response time | <500ms for dashboard, <2s for reports |
| Concurrent users | 50+ (admins + managers) |
| Data retention | 7 years (financial data), 2 years (logs) |
| Backup frequency | Daily automated, hourly for DB |
| Proxy infrastructure | 5,000+ residential Israeli IPs |
| Anti-detect browsers | GoLogin/Multilogin with 5,000+ profiles |

### 12.3 Scalability Targets

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active Etsy Stores | 1,000 | 5,000 | 15,000 |
| Active Shopify Stores | 1,000 | 5,000 | 15,000 |
| Active Account Holders | 200 | 1,000 | 3,000 |
| Daily Orders | 5,000 | 30,000 | 100,000 |
| Monthly Revenue | $500K | $3M | $15M |

---

## 13. Data Model

### 13.1 Core Entities

```
+------------------+       +------------------+       +------------------+
| ACCOUNT_HOLDER   |       |      STORE       |       |    PRODUCT       |
+------------------+       +------------------+       +------------------+
| id               |<----->| id               |<----->| id               |
| full_name        |  1:N  | account_holder_id|  1:N  | store_id         |
| teudat_zehut     |       | platform (etsy/  |       | title            |
| email            |       |   shopify)       |       | description      |
| phone            |       | store_name       |       | price            |
| address          |       | niche_id         |       | cost (POD)       |
| bank_details     |       | status           |       | pod_provider_id  |
| bit_phone        |       | health_score     |       | design_file_url  |
| status           |       | etsy_store_id    |       | etsy_listing_id  |
| max_stores       |       | shopify_store_id |       | shopify_product_id|
| torah_fund_rate  |       | mirror_store_id  |       | status           |
| total_earned     |       | created_at       |       | tags[]           |
| verified_at      |       +------------------+       +------------------+
| created_at       |
+------------------+

+------------------+       +------------------+       +------------------+
|      ORDER       |       |   TORAH_FUND     |       |     NICHE        |
+------------------+       +------------------+       +------------------+
| id               |       | id               |       | id               |
| store_id         |       | account_holder_id|       | name             |
| product_id       |       | order_id         |       | keywords[]       |
| platform         |       | sale_amount      |       | avg_margin       |
| customer_name    |       | fund_rate (5%)   |       | competition_level|
| amount           |       | fund_amount      |       | trending_score   |
| pod_cost         |       | status (pending/ |       | template_id      |
| platform_fees    |       |   paid/clawed)   |       | product_count    |
| profit           |       | payout_id        |       +------------------+
| pod_provider_id  |       | created_at       |
| pod_order_id     |       +------------------+       +------------------+
| tracking_number  |                                  |   PROXY_PROFILE  |
| status           |       +------------------+       +------------------+
| created_at       |       |     PAYOUT       |       | id               |
+------------------+       +------------------+       | store_id         |
                           | id               |       | proxy_ip         |
                           | account_holder_id|       | browser_profile  |
                           | amount_usd       |       | user_agent       |
                           | amount_ils       |       | fingerprint_hash |
                           | exchange_rate    |       | last_used        |
                           | payment_method   |       | status           |
                           | status           |       +------------------+
                           | created_at       |
                           +------------------+
```

### 13.2 Key Relationships

- **Account_Holder** 1:N **Store** (one Account Holder's identity used for multiple stores)
- **Store** 1:N **Product** (one store has many products)
- **Store** 1:1 **Store** (Etsy store mirrors one Shopify store)
- **Product** 1:N **Order** (one product can have many orders)
- **Order** 1:1 **Torah_Fund** (each order generates one Torah fund record)
- **Account_Holder** 1:N **Payout** (Account Holder receives periodic payouts)
- **Store** 1:1 **Proxy_Profile** (each store has unique digital identity)

---

## 14. API Integrations

### 14.1 Etsy API (v3 - Open API)

| Endpoint Category | Usage | Rate Limit |
|-------------------|-------|------------|
| Shops | Store management, settings | ~100/day/store |
| Listings | Create, update, delete products | ~500/day/store |
| Receipts | Order management | ~200/day/store |
| Reviews | Monitor and respond | ~100/day/store |
| Images | Upload listing images | ~300/day/store |
| Shipping | Shipping profiles, tracking | ~200/day/store |
| Taxonomy | Categories, attributes | ~100/day (shared) |

### 14.2 Shopify API (Admin REST + GraphQL)

| Endpoint Category | Usage | Rate Limit |
|-------------------|-------|------------|
| Products | Create, sync, update | 2 calls/second |
| Orders | Order management | 2 calls/second |
| Themes | Store customization | 2 calls/second |
| Inventory | Stock sync | 2 calls/second |
| Analytics | Sales data | 2 calls/second |

### 14.3 POD Provider APIs

| Provider | API Type | Auth Method |
|----------|----------|-------------|
| Printful | REST API v2 | OAuth 2.0 |
| Printify | REST API v1 | API Key |
| Gooten | REST API | API Key |
| SPOD | REST API | API Key |

### 14.4 Payment APIs

| Service | Usage |
|---------|-------|
| Wise (TransferWise) | International USD->ILS transfers |
| PayPal Payouts | VA commission payouts |
| Israeli Bank Transfer API | Direct bank payouts (Leumi, Hapoalim, Discount, Mizrahi) |
| Bit API | Israeli mobile wallet payouts |

---

## 15. Security & Compliance

### 15.1 Security Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| SEC-001 | End-to-end encryption for all API communications (TLS 1.3) | P0 |
| SEC-002 | VA credentials stored in encrypted vault (AES-256) | P0 |
| SEC-003 | Role-based access control (Admin, Manager, Viewer) | P0 |
| SEC-004 | Multi-factor authentication for admin accounts | P0 |
| SEC-005 | Audit logging of all administrative actions | P0 |
| SEC-006 | Automated security scanning in CI/CD | P1 |
| SEC-007 | Data encryption at rest (database, file storage) | P0 |
| SEC-008 | VA PII data handling compliant with Israeli Privacy Protection Law (PPLA) | P0 |
| SEC-009 | API key rotation every 90 days | P1 |
| SEC-010 | Proxy credential isolation (no cross-store leakage) | P0 |

### 15.2 Compliance Considerations

| Area | Requirement |
|------|-------------|
| Israeli Privacy Protection Law (PPLA) | VA PII protection, consent management |
| Etsy Seller Policy | Compliance checker for all listings |
| Etsy API Terms of Service | Rate limit adherence, data usage policies |
| Shopify Partner Program | Compliance with store creation policies |
| Tax Compliance | Sales tax collection where required |
| Israeli Labor & Contractor Laws | Proper VA classification (Israeli labor law, freelancer regulations) |

---

## 16. Revenue Model & Commission Structure

### 16.1 Revenue Streams

| Stream | Description |
|--------|-------------|
| Product Sales (Etsy) | Direct sales from Etsy stores minus fees & POD costs |
| Product Sales (Shopify) | Direct sales from Shopify mirrors minus fees & POD costs |
| Etsy Ads Revenue | Net positive from ad spend optimization |

### 16.2 Cost Structure

| Cost Item | Typical % of Sale |
|-----------|-------------------|
| POD Production + Shipping | 30-40% |
| Etsy Transaction + Processing Fees | 11-15% |
| Shopify Subscription + Fees | 3-5% |
| Etsy Ads | 5-12% |
| Account Holder Torah Fund | 5% |
| Proxy/Anti-detect Infrastructure | Fixed monthly |
| Platform Hosting & Tools | Fixed monthly |

### 16.3 Unit Economics Example

```
Average Selling Price:              $30.00
  - POD Cost:                       -$10.50  (35%)
  - Etsy Fees (6.5% + $0.20 + 3%): -$3.05   (10.2%)
  - Etsy Ads (8%):                  -$2.40   (8%)
  - Torah Fund (5%):                -$1.50   (5%)
  ----------------------------------------
  Net Profit per Sale:              $12.55   (41.8%)

  x 5,000 orders/month = $62,750/month net profit
  x 30,000 orders/month = $376,500/month net profit
```

---

## 17. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Mass Etsy account suspension | Medium | Critical | Warm-up protocol, account isolation, appeal system |
| Etsy API changes/restrictions | Medium | High | API version monitoring, abstraction layer, manual fallback |
| Account Holder identity issues | Low | High | One-time KYC verification, Teudat Zehut validation, community vetting |
| POD quality issues | Medium | Medium | Multi-provider fallback, sample testing, reviews monitoring |
| Etsy policy changes | Medium | High | Policy monitoring, automated compliance updates |
| Data breach (VA PII) | Low | Critical | Encryption, access controls, audit logging |
| Israeli regulatory changes | Low | Medium | Legal counsel, contractor agreement updates |
| Currency fluctuation (USD/ILS) | Medium | Low | Lock exchange rates at payout, hedging |
| Shopify Partner program changes | Low | Medium | Alternative store creation methods |
| Competitor copying model | High | Medium | Speed to scale, proprietary tooling, niche expertise |

---

## 18. Rollout Phases

### Phase 1: Foundation (Months 1-3)
- [ ] Core dashboard (store management, basic analytics)
- [ ] Etsy API integration (listings, orders)
- [ ] Account Holder management system (profiles, identity verification, store mapping)
- [ ] Single POD provider integration (Printful)
- [ ] Admin-driven store creation workflow (fully automated)
- [ ] Torah fund tracking (manual payout)
- **Target:** 50 active stores, 10 Account Holders

### Phase 2: Automation (Months 4-6)
- [ ] Automated store warm-up protocol
- [ ] Shopify mirror generator
- [ ] Multi-POD provider routing
- [ ] Etsy SEO engine
- [ ] Automated Torah fund payouts (Israeli bank/Bit/PayPal)
- [ ] Anti-detect browser profile management
- [ ] Proxy rotation system
- **Target:** 250 active stores, 50 Account Holders

### Phase 3: Scale (Months 7-9)
- [ ] Etsy Ads automation
- [ ] Sales acceleration engine
- [ ] Advanced analytics and reporting
- [ ] Store health monitoring and auto-remediation
- [ ] Niche research and trend detection
- [ ] Full automation pipeline (zero manual intervention)
- **Target:** 1,000 active stores, 200 Account Holders

### Phase 4: Optimization (Months 10-12)
- [ ] AI-powered design generation
- [ ] Dynamic pricing engine
- [ ] Social media auto-posting
- [ ] Advanced financial forecasting
- [ ] Store cloning and template library
- [ ] Account Holder self-service payout dashboard
- **Target:** 2,000+ active stores, 400+ Account Holders

---

## 19. Success Metrics / KPIs

### 19.1 Business KPIs

| KPI | Target (Month 6) | Target (Month 12) |
|-----|-------------------|--------------------|
| Active Stores (Etsy) | 250 | 1,000+ |
| Active Stores (Shopify) | 250 | 1,000+ |
| Monthly Revenue | $100K | $500K+ |
| Net Profit Margin | 35%+ | 40%+ |
| Orders per Day | 500 | 5,000+ |
| Store Suspension Rate | <5% | <2% |

### 19.2 Operational KPIs

| KPI | Target |
|-----|--------|
| Listing automation rate | 95%+ |
| Order fulfillment automation | 98%+ |
| Average order-to-ship time | <72 hours |
| Torah fund payout accuracy | 99.9% |
| Platform uptime | 99.9% |
| API error rate | <0.1% |

### 19.3 Account Holder KPIs

| KPI | Target |
|-----|--------|
| Account Holder retention rate | >90% (annual) |
| Average stores per Account Holder | 5 |
| Account Holder onboarding time | <1 day |
| Torah fund payout on-time rate | >99% |

---

## 20. Glossary

| Term | Definition |
|------|------------|
| **Account Holder** | Person from the Haredi community in Israel who provides their identity for Etsy store registration; passive role with 5% Torah fund payout |
| **POD** | Print on Demand - manufacturing model where products are only produced when ordered |
| **Mirror Store** | Shopify store that replicates an Etsy store's catalog |
| **Store Factory** | Automated system for creating and configuring new Etsy stores |
| **Warm-up Protocol** | Gradual ramp-up of store activity to avoid Etsy suspicion |
| **Anti-detect** | Browser fingerprinting evasion technology |
| **ROAS** | Return on Ad Spend |
| **Niche** | Specific product category/vertical a store focuses on |
| **Store Health Score** | Composite metric measuring store performance and compliance |
| **Fund Clawback** | Reversal of Account Holder Torah fund payout due to order refund |
| **Torah Fund** | 5% of each sale paid to Account Holder to support Torah study (מעשר לתורה) |
| **PPLA** | Privacy Protection Law of 1981 (Israeli data protection law) |
| **Bit** | Popular Israeli mobile payment app (by Bank Leumi) |
| **KYC** | Know Your Customer - identity verification process |
| **Shabbat** | Jewish Sabbath - Friday sunset to Saturday nightfall, no work permitted |
| **ILS** | Israeli New Shekel - currency of Israel |

---

## Appendix A: Account Holder Onboarding Checklist

1. Community referral or recruitment contact
2. Sign agreement (digital - Hebrew + English) - defines passive role & 5% Torah fund terms
3. Submit KYC documents (Teudat Zehut / Israeli ID, selfie verification)
4. Provide bank details (Israeli bank account or Bit app) for payouts
5. Admin creates Etsy account using Account Holder's identity
6. Admin verifies store setup (identity matches, account active)
7. Account Holder receives confirmation - no further action required
8. Monthly Torah fund payouts begin automatically

**Note:** Onboarding meetings are never scheduled on Shabbat or Jewish holidays.
**Note:** Account Holder has NO access to store management - all operations run by Admin via full automation.

## Appendix B: Niche Categories (Initial)

| Category | Sub-niches | Avg. Margin |
|----------|------------|-------------|
| Home Decor | Wall art, throw pillows, candles, prints | 45-55% |
| Apparel | T-shirts, hoodies, tank tops, custom shoes | 35-45% |
| Accessories | Tote bags, phone cases, jewelry, hats | 40-50% |
| Pet Products | Pet portraits, bandanas, bowls, tags | 45-55% |
| Wedding | Invitations, gifts, decor, custom signs | 50-60% |
| Baby & Kids | Onesies, nursery decor, milestone cards | 40-50% |
| Seasonal | Holiday decor, Valentine's, Halloween | 45-55% |
| Stickers & Paper | Planner stickers, greeting cards, prints | 55-65% |

---

*End of BRD Document*
