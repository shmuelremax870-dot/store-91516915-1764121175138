# Business Requirements Document (BRD)

## Project: Multi-Store E-Commerce Automation Platform

**Version:** 1.0
**Date:** 2026-02-24
**Status:** Draft

---

## 1. Executive Summary

פלטפורמה מתוחכמת ליצירה, ניהול והאצת מכירות של אלפי חנויות Etsy ו-Shopify בו-זמנית. הפלטפורמה משלבת Print-on-Demand (POD), דשבורד ניהול מרכזי, ומנוע האצת מכירות מבוסס AI. מודל כוח האדם מבוסס על אופרטורים בפיליפינים שפותחים חנויות על שמם ומקבלים עמלה של 1% מהמכירות.

**Core Value Proposition:**
- Mass store creation — automated at scale (thousands of stores)
- Unified management dashboard for all stores
- POD integration for zero-inventory fulfillment
- AI-driven sales acceleration
- Distributed workforce with automated commission payouts

---

## 2. Business Objectives

| # | Objective | Target | Timeline |
|---|-----------|--------|----------|
| O1 | MVP — core store creation + dashboard | 50 stores | Month 3 |
| O2 | POD integration with auto-fulfillment | 3+ POD providers | Month 4 |
| O3 | Scale store operations | 1,000+ stores | Month 6 |
| O4 | Positive unit economics per store | >$200/store/month net | Month 8 |
| O5 | Scale workforce | 500+ operators | Month 9 |
| O6 | Sales acceleration live | 30% conversion increase | Month 10 |
| O7 | Full scale | 5,000+ stores | Month 12 |

---

## 3. Scope

### In Scope
- Etsy store creation and management automation
- Shopify store creation and management automation
- POD provider integration (Printful, Printify, Gooten, etc.)
- Centralized multi-store management dashboard
- Workforce (operator) management and onboarding
- Automated commission calculation and payment (1% base)
- Sales acceleration tools (SEO, pricing, promotions)
- Analytics and reporting
- Anti-detection and store isolation mechanisms

### Out of Scope (v1)
- Amazon / eBay integration
- Custom manufacturing (non-POD)
- Physical inventory management
- Mobile native app (web-responsive only)

---

## 4. Stakeholders

| Role | Responsibility |
|------|---------------|
| **Platform Owner** | Strategy, financial oversight, P&L |
| **Platform Admin** | Daily operations, workforce management |
| **Store Operators (PH)** | Store registration, identity verification, basic maintenance |
| **Product Designers** | Creating designs for POD products |
| **Dev Team** | Platform development and scaling |
| **POD Suppliers** | Product fulfillment, shipping, QC |

---

## 5. Platform Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CENTRAL DASHBOARD (Web App)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │  Store    │ │ Workforce│ │ Analytics│ │ Sales Acceleration│  │
│  │  Manager  │ │ Manager  │ │ & BI     │ │ Engine            │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬──────────┘  │
├───────┼─────────────┼────────────┼─────────────────┼─────────────┤
│                    CORE SERVICES LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              API Gateway / Message Queue                  │   │
│  └────┬──────────┬──────────┬──────────┬──────────┬─────────┘   │
│  ┌────┴───┐ ┌───┴────┐ ┌──┴───┐ ┌───┴────┐ ┌──┴──────────┐   │
│  │ Store  │ │  POD   │ │Finance│ │Identity│ │  Anti-      │   │
│  │Factory │ │ Bridge │ │Engine │ │ Mgmt   │ │  Detection  │   │
│  └────┬───┘ └───┬────┘ └──┬───┘ └───┬────┘ └──┬──────────┘   │
├───────┼─────────┼─────────┼─────────┼──────────┼───────────────┤
│                   EXTERNAL INTEGRATIONS                         │
│  ┌────┴───┐ ┌───┴────┐ ┌──┴───┐ ┌──┴────┐ ┌──┴──────────┐   │
│  │  Etsy  │ │Printful│ │Payment│ │  KYC  │ │  Proxy/VPN  │   │
│  │Shopify │ │Printify│ │Gateway│ │Service│ │  Services   │   │
│  │  APIs  │ │Gooten  │ │       │ │       │ │             │   │
│  └────────┘ └────────┘ └──────┘ └───────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. Module 1: Store Factory — Mass Store Generation Engine

### 6.1 Store Creation Pipeline

| ID | Requirement | Priority |
|----|-------------|----------|
| SF-001 | Automated Etsy store registration flow | P0 |
| SF-002 | Automated Shopify store creation via API | P0 |
| SF-003 | Unique brand identity per store (name, logo, banner, about section) | P0 |
| SF-004 | AI-powered brand name generator with niche-awareness | P1 |
| SF-005 | AI logo/banner generation (DALL-E / Stable Diffusion) | P1 |
| SF-006 | Template library for store policies (shipping, returns, FAQs) | P0 |
| SF-007 | Batch store creation — up to 50 stores per batch | P1 |
| SF-008 | Creation queue with retry logic and failure handling | P0 |
| SF-009 | Store warm-up sequence — gradual activity to build store credibility | P0 |

### 6.2 Niche & Category Management

| ID | Requirement | Priority |
|----|-------------|----------|
| SF-010 | Define store niches (home decor, apparel, pets, humor, holiday, etc.) | P0 |
| SF-011 | Auto-assign niche based on market demand analysis | P1 |
| SF-012 | Niche rotation — avoid over-saturation in any single category | P1 |
| SF-013 | Cross-niche product seeding to diversify revenue | P2 |

### 6.3 Product Listing Automation

| ID | Requirement | Priority |
|----|-------------|----------|
| SF-020 | Bulk product upload (titles, descriptions, images, pricing, tags) | P0 |
| SF-021 | AI-generated titles optimized for Etsy/Shopify SEO | P0 |
| SF-022 | AI-generated unique descriptions (avoid duplication flags) | P0 |
| SF-023 | Smart tag generation based on trending keywords | P1 |
| SF-024 | Mockup image generation — auto-apply designs to POD templates | P0 |
| SF-025 | Variant management (sizes, colors, styles) | P0 |
| SF-026 | Margin-based auto-pricing engine | P1 |
| SF-027 | Listing scheduler — stagger listings to appear organic | P1 |
| SF-028 | Duplicate detection — prevent identical products across linked stores | P0 |

### 6.4 Etsy-Specific Sophistication

| ID | Requirement | Priority |
|----|-------------|----------|
| SF-030 | Etsy's one-store-per-person rule — each operator owns stores under their legal identity | P0 |
| SF-031 | Gradual listing ramp-up for new stores (avoid velocity flags) | P0 |
| SF-032 | Organic behavior simulation — browsing, favoriting, natural timing patterns | P0 |
| SF-033 | Review acquisition strategy — competitive pricing on first orders to earn reviews | P1 |
| SF-034 | Store age diversification — stagger store creation over weeks | P0 |
| SF-035 | Variation in store styles — unique templates, fonts, photo styles per store | P1 |
| SF-036 | IP and device fingerprint isolation per store (see Module 7) | P0 |

---

## 7. Module 2: POD Integration Layer

### 7.1 Supported Providers

| Provider | Product Types | Priority |
|----------|--------------|----------|
| **Printful** | Apparel, home & living, accessories | P0 |
| **Printify** | Apparel, mugs, phone cases, wall art | P0 |
| **Gooten** | Apparel, home goods, accessories | P1 |
| **CustomCat** | Apparel, specialty items | P2 |
| **SPOD** | Fast-ship apparel | P2 |

### 7.2 Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| POD-001 | API integration with each POD provider for catalog sync | P0 |
| POD-002 | Auto order routing — sale on Etsy/Shopify triggers POD order | P0 |
| POD-003 | Shipping tracking sync — pull tracking from POD, push to marketplace | P0 |
| POD-004 | Multi-provider price comparison — auto-select cheapest per product type | P1 |
| POD-005 | Design file management — upload, store, version-control assets | P0 |
| POD-006 | Product quality monitoring — track complaints per provider/product | P1 |
| POD-007 | Fallback routing — if primary POD is out of stock, route to backup | P1 |
| POD-008 | Bulk design upload — apply one design to multiple product types | P0 |
| POD-009 | Sample ordering for quality review | P2 |
| POD-010 | Cost tracking per order with COGS calculation | P0 |

---

## 8. Module 3: Central Dashboard & Store Management

### 8.1 Overview / Home Screen

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-001 | Real-time revenue ticker across all stores | P0 |
| DASH-002 | Active stores count with health status (green/yellow/red) | P0 |
| DASH-003 | Today's orders, revenue, profit summary | P0 |
| DASH-004 | Top performing stores (by revenue, orders, conversion) | P0 |
| DASH-005 | Alert center — flagged stores, failed orders, operator issues | P0 |
| DASH-006 | Quick actions — pause store, bulk edit pricing, reassign operator | P1 |

### 8.2 Store Management

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-010 | Searchable/filterable list with key metrics | P0 |
| DASH-011 | Store detail: revenue, orders, products, operator, health score | P0 |
| DASH-012 | Bulk actions: pause/resume, change pricing, update policies | P0 |
| DASH-013 | Store grouping by niche, operator, region, performance tier | P1 |
| DASH-014 | Store lifecycle: creation → active → warning → suspended → archived | P0 |
| DASH-015 | Store cloning — duplicate a successful store's configuration | P1 |

### 8.3 Order Management

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-020 | Unified order feed across all stores and platforms | P0 |
| DASH-021 | Order tracking: placed → sent to POD → in production → shipped → delivered | P0 |
| DASH-022 | Automated customer communication templates | P1 |
| DASH-023 | Dispute/return management workflow | P1 |
| DASH-024 | Real-time profit per order (sale - POD cost - fees - commission) | P0 |

### 8.4 Product Management

| ID | Requirement | Priority |
|----|-------------|----------|
| DASH-030 | Central design library shared across stores | P0 |
| DASH-031 | Product analytics: views, favorites, sales, conversion | P0 |
| DASH-032 | A/B testing for titles, images, pricing | P1 |
| DASH-033 | Trend-based product suggestions | P2 |
| DASH-034 | Seasonal product calendar — auto-push holiday products | P1 |

---

## 9. Module 4: Sales Acceleration Engine

### 9.1 SEO Optimization

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-001 | Etsy SEO analyzer — score listing tag/title/description effectiveness | P0 |
| SA-002 | Keyword research — trending and high-volume keywords per niche | P0 |
| SA-003 | Auto-optimize titles based on keyword performance | P1 |
| SA-004 | Tag rotation — periodically refresh tags for new trends | P1 |
| SA-005 | Competitor analysis — track competitor listings and pricing | P2 |

### 9.2 Pricing Optimization

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-010 | Dynamic pricing — adjust by demand, competition, margins | P1 |
| SA-011 | Sale/coupon automation — create and schedule promos | P1 |
| SA-012 | Price testing across similar stores | P2 |
| SA-013 | Margin protection — never price below minimum threshold | P0 |

### 9.3 Etsy Algorithm Optimization

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-020 | Strategic listing renewal for visibility boost | P1 |
| SA-021 | Etsy Ads — automated bid management for promoted listings | P1 |
| SA-022 | Review solicitation — automated post-purchase follow-up | P2 |
| SA-023 | Favorite/view ratio tracking to spot listing quality issues | P1 |
| SA-024 | Shop score monitoring with improvement recommendations | P1 |

### 9.4 Cross-Store Synergies

| ID | Requirement | Priority |
|----|-------------|----------|
| SA-030 | Winning product detection — replicate top sellers across stores | P0 |
| SA-031 | Price gap analysis across the store network | P1 |
| SA-032 | Demand forecasting from aggregated data | P2 |
| SA-033 | Cross-store promotion of related products | P2 |

---

## 10. Module 5: Workforce Management System

### 10.1 Operator Onboarding

| ID | Requirement | Priority |
|----|-------------|----------|
| WF-001 | Operator registration portal (personal details, gov ID, bank info) | P0 |
| WF-002 | Identity verification (KYC) workflow | P0 |
| WF-003 | Digital contract signing (terms, NDA, commission structure) | P0 |
| WF-004 | Onboarding training module — step-by-step store registration guides | P1 |
| WF-005 | Operator capacity tracking — max stores per operator | P0 |

### 10.2 Operator Management

| ID | Requirement | Priority |
|----|-------------|----------|
| WF-010 | Operator dashboard — assigned stores, earnings, tasks | P0 |
| WF-011 | Task assignment system for store creation/maintenance | P0 |
| WF-012 | Performance scoring (task completion, response time, store health) | P1 |
| WF-013 | In-app messaging between admin and operators | P1 |
| WF-014 | Operator tier system — top performers get more assignments | P2 |
| WF-015 | Operator replacement — transfer stores if operator goes inactive | P0 |

### 10.3 Store-Operator Assignment

| ID | Requirement | Priority |
|----|-------------|----------|
| WF-020 | Assign multiple stores per operator (configurable limit) | P0 |
| WF-021 | Track which stores belong to which operator | P0 |
| WF-022 | Operator activity log per store | P1 |
| WF-023 | Geographical distribution of operators | P1 |

---

## 11. Module 6: Financial & Commission Engine

### 11.1 Revenue Tracking

| ID | Requirement | Priority |
|----|-------------|----------|
| FIN-001 | Real-time revenue aggregation across all stores | P0 |
| FIN-002 | Breakdown by store, niche, product type, operator, platform | P0 |
| FIN-003 | Platform fee tracking (Etsy fees, Shopify fees, payment processing) | P0 |
| FIN-004 | POD cost tracking per order | P0 |
| FIN-005 | Net profit: Revenue - POD Cost - Platform Fees - Commission - Ad Spend | P0 |

### 11.2 Commission System

| ID | Requirement | Priority |
|----|-------------|----------|
| FIN-010 | **Base commission: 1% of gross sales** per operator | P0 |
| FIN-011 | Configurable tiers (1% base, 1.5% for top performers) | P1 |
| FIN-012 | Automated calculation per pay period (weekly/bi-weekly/monthly) | P0 |
| FIN-013 | Commission dashboard — operators view real-time earnings | P0 |
| FIN-014 | Bonus system for exceeding targets | P2 |
| FIN-015 | Deductions for violations or chargebacks | P1 |

### 11.3 Payouts

| ID | Requirement | Priority |
|----|-------------|----------|
| FIN-020 | Automated payouts (PayPal, Wise, direct bank transfer) | P0 |
| FIN-021 | Configurable pay schedules | P0 |
| FIN-022 | Approval workflow for amounts above threshold | P1 |
| FIN-023 | Payout history and receipt generation | P0 |
| FIN-024 | Multi-currency (USD, PHP) with auto-conversion | P0 |
| FIN-025 | Tax documentation (1099 for US, BIR for PH) | P1 |

---

## 12. Module 7: Anti-Detection & Store Isolation

### 12.1 Store Isolation (Critical for Etsy)

| ID | Requirement | Priority |
|----|-------------|----------|
| AD-001 | Unique residential IP per store (proxy rotation) | P0 |
| AD-002 | Unique browser fingerprint per store session | P0 |
| AD-003 | Separate email accounts per store | P0 |
| AD-004 | Separate payment accounts per store/operator | P0 |
| AD-005 | No shared design files across stores (unique mockup variations) | P0 |
| AD-006 | Unique store policies and about sections (AI-rewritten) | P0 |
| AD-007 | Staggered activity — avoid simultaneous actions across stores | P1 |
| AD-008 | Human-like behavior simulation — random delays, browsing patterns | P1 |
| AD-009 | Unique product photography style per store (different mockup templates, angles, backgrounds) | P0 |
| AD-010 | Different listing schedules per store (vary posting times, frequencies) | P1 |

### 12.2 Monitoring & Alerting

| ID | Requirement | Priority |
|----|-------------|----------|
| AD-020 | Store health monitoring — detect early warning signs of scrutiny | P0 |
| AD-021 | Auto-pause when suspicious activity detected | P0 |
| AD-022 | IP reputation monitoring | P1 |
| AD-023 | Platform ToS change detector — alert on Etsy/Shopify policy updates | P1 |

### 12.3 Legal Compliance

| ID | Requirement | Priority |
|----|-------------|----------|
| AD-030 | Clear operator agreements defining business relationship | P0 |
| AD-031 | Tax compliance per jurisdiction | P0 |
| AD-032 | Consumer protection compliance (returns, refunds) | P0 |
| AD-033 | GDPR/data protection for operator data | P0 |
| AD-034 | IP verification — ensure designs don't infringe copyrights | P0 |

---

## 13. Module 8: Analytics & BI

| ID | Requirement | Priority |
|----|-------------|----------|
| BI-001 | Executive dashboard: P&L, growth trends, forecasts | P0 |
| BI-002 | Store-level analytics: revenue, orders, conversion, AOV | P0 |
| BI-003 | Product-level: best sellers, worst performers, trend analysis | P0 |
| BI-004 | Operator performance analytics | P1 |
| BI-005 | Niche performance comparison | P1 |
| BI-006 | POD provider comparison (cost, speed, quality) | P1 |
| BI-007 | Custom report builder with export (CSV, PDF) | P2 |
| BI-008 | Automated daily/weekly summary reports via email | P1 |
| BI-009 | Cohort analysis — store performance over time from creation | P2 |
| BI-010 | Revenue forecasting using ML | P2 |

---

## 14. Technical Requirements

### 14.1 Recommended Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js + React + TypeScript | Fast, SEO-ready, type-safe |
| **UI** | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| **Backend** | Node.js + NestJS | Scalable, modular, TypeScript-native |
| **Database** | PostgreSQL + Redis | Relational + caching/queues |
| **Queue** | BullMQ (Redis) | Job scheduling, store creation queues |
| **ORM** | Prisma | Type-safe DB access |
| **Auth** | NextAuth.js + JWT | Multi-role auth |
| **Storage** | AWS S3 / Cloudflare R2 | Design assets, mockups |
| **Proxy** | Bright Data / Smartproxy | Residential proxy rotation |
| **AI** | OpenAI GPT-4 + DALL-E / Stable Diffusion | Content & design generation |
| **Payments** | Wise API + PayPal API | Operator payouts |
| **Hosting** | AWS ECS or Vercel + Railway | Scalable infrastructure |
| **Monitoring** | Datadog / Grafana + Sentry | Observability |
| **CI/CD** | GitHub Actions | Automated deployment |

### 14.2 Database Schema (High-Level)

```sql
-- Core entities
stores          (id, platform, url, name, niche_id, operator_id, status, health_score, ...)
operators       (id, name, email, country, kyc_status, bank_info, commission_rate, max_stores, performance_score, ...)
products        (id, store_id, design_id, title, description, price, cost, platform_listing_id, views, favorites, sales, ...)
designs         (id, file_url, niche_id, type, created_by, ...)
orders          (id, store_id, product_id, platform_order_id, status, revenue, pod_cost, platform_fees, commission, net_profit, tracking_number, ...)
commissions     (id, operator_id, order_id, amount, status, pay_period, ...)
proxies         (id, store_id, ip_address, provider, status, last_rotated, ...)
niches          (id, name, keywords[], saturation_score, avg_revenue_per_store, ...)
store_sessions  (id, store_id, fingerprint_data, proxy_id, last_active, ...)
```

---

## 15. Non-Functional Requirements

| Category | Requirement | Target |
|----------|-------------|--------|
| **Performance** | Dashboard load time | < 2 seconds |
| **Performance** | Order sync latency | < 5 minutes |
| **Performance** | Concurrent store management | 10,000+ stores |
| **Scalability** | Horizontal auto-scaling | All services |
| **Availability** | Uptime | 99.9% |
| **Security** | Data encryption | AES-256 / TLS 1.3 |
| **Security** | RBAC | Admin, Manager, Operator roles |
| **Security** | Operator data isolation | See only their stores |
| **Backup** | Automated daily backups | 30-day retention |
| **DR** | Recovery Time Objective | < 4 hours |
| **i18n** | Dashboard languages | English, Filipino (Tagalog) |

---

## 16. Risk Assessment

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Etsy detects linked stores → mass suspension | High | Critical | Full store isolation (unique IPs, fingerprints, operators). Gradual scaling. Rapid replacement pipeline. |
| R2 | Etsy API changes or restricts access | Medium | High | Abstract API layer. Monitor changelog. Backup browser automation. |
| R3 | POD quality issues → negative reviews | Medium | High | Multi-provider failover. Sample testing. Review monitoring. |
| R4 | Operator fraud or misuse | Medium | Medium | Limited permissions. Activity logging. Access controls. Contracts. |
| R5 | Marketplace ToS changes | Medium | High | Automated policy monitoring. Legal review. Platform-agnostic architecture. |
| R6 | Copyright infringement claims | Medium | High | AI originality checks. DMCA response workflow. |
| R7 | Operator churn | Medium | Medium | Operator pool redundancy. Auto store transfer. Competitive commission. |
| R8 | Payment processing disruptions | Low | High | Multiple payment rails. Reserve funds. |
| R9 | Data breach | Low | Critical | Encryption. Access controls. Security audits. |
| R10 | Legal action against model | Low | Critical | Legal counsel. Legitimate service contracts. Multi-jurisdiction. |

---

## 17. Rollout Strategy

### Phase 1: Foundation (Months 1-3)
- Core platform development (dashboard, store management)
- Etsy API integration
- Printful integration
- Operator onboarding portal
- Manual store creation (operator-assisted)
- **Target: 50 stores live**

### Phase 2: Automation (Months 3-6)
- Automated store creation pipeline
- AI product listing generation
- Auto order routing to POD
- Commission engine v1
- Shopify integration
- Printify integration
- Anti-detection layer v1
- **Target: 500 stores live**

### Phase 3: Scale (Months 6-9)
- Mass batch store creation
- Advanced analytics and BI
- Sales acceleration tools (SEO, pricing)
- Operator performance management
- Dynamic pricing engine
- **Target: 2,000 stores live**

### Phase 4: Optimization (Months 9-12)
- AI-driven sales acceleration
- Cross-store synergy tools
- Advanced anti-detection
- Revenue forecasting
- Full automation — minimal manual intervention
- **Target: 5,000+ stores live**

---

## 18. Success Metrics & KPIs

### Business KPIs

| KPI | Month 6 | Month 12 |
|-----|---------|----------|
| Total Active Stores | 500 | 5,000 |
| Monthly Gross Revenue | $100,000 | $1,500,000 |
| Monthly Net Profit | $30,000 | $500,000 |
| Avg Revenue Per Store | $200/mo | $300/mo |
| Store Survival Rate (6mo) | 70% | 80% |
| Active Operators | 100 | 500 |

### Operational KPIs

| KPI | Target |
|-----|--------|
| Store Creation Time | < 2 hours |
| Order Fulfillment to POD | < 30 minutes |
| Product Listing Time | < 5 minutes/product |
| System Uptime | 99.9% |
| Operator Support Response | < 4 hours |

### Sales KPIs

| KPI | Target |
|-----|--------|
| Avg Conversion Rate | > 2.5% |
| Avg Order Value | > $25 |
| Customer Return Rate | < 5% |
| Avg Store Rating | > 4.5 stars |

---

## 19. Budget Estimation

### Development (Year 1)

| Category | Monthly | Annual |
|----------|---------|--------|
| Dev Team (5 devs) | $25,000 | $300,000 |
| UI/UX Design | $3,000 | $36,000 |
| Project Management | $5,000 | $60,000 |
| **Subtotal** | **$33,000** | **$396,000** |

### Infrastructure (at scale)

| Category | Monthly | Annual |
|----------|---------|--------|
| Cloud Hosting | $2,000 | $24,000 |
| Proxy Services (Bright Data) | $5,000 | $60,000 |
| AI APIs (OpenAI) | $3,000 | $36,000 |
| Email/SMS | $500 | $6,000 |
| Monitoring | $500 | $6,000 |
| **Subtotal** | **$11,000** | **$132,000** |

### Operations (at 5,000 stores)

| Category | Monthly | Annual |
|----------|---------|--------|
| Operator Commissions (1%) | $15,000 | $180,000 |
| Marketplace Listing Fees | $10,000 | $120,000 |
| Etsy Ads Budget | $20,000 | $240,000 |
| Customer Support | $3,000 | $36,000 |
| Legal/Compliance | $2,000 | $24,000 |
| **Subtotal** | **$50,000** | **$600,000** |

### Total Year 1

| Category | Amount |
|----------|--------|
| Development | $396,000 |
| Infrastructure | $132,000 |
| Operations | $600,000 |
| Contingency (15%) | $169,200 |
| **Total** | **$1,297,200** |

### Projected P&L at Month 12

| Metric | Monthly |
|--------|---------|
| Gross Revenue | $1,500,000 |
| POD Costs (~40%) | -$600,000 |
| Platform Fees (~12%) | -$180,000 |
| Operator Commission (1%) | -$15,000 |
| Ads | -$20,000 |
| Infrastructure | -$11,000 |
| Operations | -$33,000 |
| **Net Profit** | **~$641,000/mo** |

---

## 20. Appendix A: Etsy Constraints & Mitigations

| Constraint | Detail | Mitigation |
|-----------|--------|------------|
| One store per person | Each Etsy account tied to individual | Operator model — each operator owns stores under their identity |
| Linked account detection | Etsy detects shared IPs, devices, payment methods | Full isolation per store (proxy, fingerprint, payment) |
| Listing limits for new stores | New stores may have caps | Gradual listing ramp-up |
| Review velocity | New stores have no reviews = low trust | Competitive pricing on first orders. Review acquisition strategy |
| Etsy Ads minimum | Minimum daily ad budgets | Budget allocation engine |
| Payment hold periods | New stores have 3-day payment holds | Factor into cash flow planning |
| Star Seller requirements | Need 95% shipping on time, 95% message response, $300+ revenue | Automated tracking sync + message auto-response |

## 21. Appendix B: Operator Agreement Key Terms

1. Operator registers store(s) using their own legal identity
2. Operator grants platform administrative access to manage operations
3. Commission: **1% of gross sales** through assigned stores
4. Payment: Monthly via Wise/PayPal
5. Operator must not independently modify store settings without authorization
6. NDA covering all business operations and strategies
7. Termination: 30-day notice with store transition plan
8. Operator is an independent contractor (not employee)
9. Non-compete: operator may not run competing stores outside the platform
10. Dispute resolution: arbitration in agreed jurisdiction

## 22. Appendix C: Glossary

| Term | Definition |
|------|-----------|
| **POD** | Print-on-Demand — products printed only after customer order |
| **Operator** | Workforce member who registers and maintains marketplace stores |
| **Niche** | A specific product category or market segment |
| **Store Factory** | Automated system for creating new stores |
| **Health Score** | Composite metric of store standing (reviews, sales, compliance) |
| **COGS** | Cost of Goods Sold — the POD cost of a product |
| **Listing Renewal** | Etsy feature where renewing a listing boosts visibility |
| **Conversion Rate** | Percentage of visitors who make a purchase |
| **Store Isolation** | Ensuring no technical linkage between stores |
| **Star Seller** | Etsy badge for stores meeting quality thresholds |
| **Fingerprint** | Browser/device characteristics used to identify users |

---

*End of Document*

**Next Steps:**
1. Stakeholder review and approval of this BRD
2. Prioritize Phase 1 features for sprint planning
3. Technical Architecture Design document (TAD)
4. Legal review of operator agreement templates
5. POD provider evaluation and contract negotiation
6. Begin recruiting operator pilot group (10-20 operators)
