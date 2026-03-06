# SHOPIFY-SHOP-AUTO -- Business Requirements Document

**Version:** 2.0
**Date:** 2026-03-05
**Status:** Draft
**Project Code:** SHOPIFY-SHOP-AUTO

---

## Prioritized Roadmap (Summary)

| Priority | Capability | Target Phase |
|----------|-----------|--------------|
| **P0** | Store Factory -- guided provisioning + standardized configuration under one legal entity (automation gated on Shopify approval) | Phase 1 |
| **P0** | POD Integration Layer (Printful + Printify) | Phase 1 |
| **P0** | Central Management Dashboard (multi-store admin) | Phase 1 |
| **P0** | Finance & Reporting -- unit economics, fee tracking | Phase 1 |
| **P0** | Compliance & Governance -- Shopify policy, tax config, audit log | Phase 1 |
| **P1** | Programmatic store provisioning (if Shopify provides an approved API / written confirmation) -- otherwise manual creation remains | Phase 2 |
| **P1** | Brand/Niche Template System (themes, copy, imagery) | Phase 2 |
| **P1** | Design Generation Pipeline (Midjourney-based creative) | Phase 2 |
| **P1** | Growth Engine -- SEO automation, pricing rules | Phase 2 |
| **P1** | Tax engine integration (TaxJar / Avalara) | Phase 2 |
| **P1** | Guided Manual Launch Flow | Phase 2 |
| **P2** | Advanced analytics & forecasting | Phase 3 |
| **P2** | Dynamic pricing intelligence | Phase 3 |
| **P2** | Social/external traffic automation | Phase 4 |
| **P2** | Additional POD providers (Gooten, SPOD, CustomCat) | Phase 3 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Objectives](#2-business-objectives)
3. [Scope](#3-scope)
4. [System Architecture Overview](#4-system-architecture-overview)
5. [Core Modules](#5-core-modules)
   - A: Store Factory
   - B: Brand/Niche Template System
   - C: Design Generation Pipeline
   - D: POD Integration Layer
   - E: Central Management Dashboard
   - F: Finance & Reporting
   - G: Compliance & Governance
   - H: Growth Engine
6. [Tax Strategy](#6-tax-strategy)
7. [Launch Flows](#7-launch-flows)
8. [Data Model](#8-data-model)
9. [Integrations](#9-integrations)
10. [Security & Privacy](#10-security--privacy)
11. [Revenue Model & Unit Economics](#11-revenue-model--unit-economics)
12. [Risk Assessment](#12-risk-assessment)
13. [Rollout Phases](#13-rollout-phases)
14. [Success Metrics / KPIs](#14-success-metrics--kpis)
15. [Open Questions](#15-open-questions)
16. [Glossary](#16-glossary)

---

## 1. Executive Summary

This document defines the business requirements for a **Shopify-first Store Factory** platform. The platform enables a **single legal entity** (one company, one owner) to launch and manage **many niche-branded Shopify stores**, each selling Print-on-Demand products to international customers.

**Key principles:**

- **One owner, many brands.** All stores are owned by the same registered company. No identity renting, no third-party account holders, no passive identity schemes.
- **International-first.** Stores are designed to serve global markets (EU, UK, AU, CA) as the primary audience, with US sales handled through proper tax compliance -- not avoidance.
- **Full legitimacy.** No anti-detection, no fingerprint manipulation, no proxy rotation. Every store is a transparent extension of the same business.
- **Two launch modes.** Fully automated (zero-touch after approval) and guided manual (human-in-the-loop).
- **POD fulfillment.** Zero-inventory model via Printful, Printify, and other POD providers.

The platform replaces the previously drafted BRD (v1.0, ETSY-SHOP-AUTO) which relied on an unviable operating model.

---

## 2. Business Objectives

| # | Objective | Measurable Target |
|---|-----------|-------------------|
| BO-1 | Launch multiple niche Shopify stores under one legal entity | 50 stores in Year 1, 200 in Year 2 |
| BO-2 | Automate store creation, product listing, and order fulfillment | 90%+ automation rate by Month 6 |
| BO-3 | Centralize operations in a single management dashboard | Single pane of glass for all stores |
| BO-4 | Achieve positive unit economics per store within 90 days of launch | Gross margin > 30% per store |
| BO-5 | Maintain full compliance with Shopify policies and tax law | Zero policy violations, zero tax penalties |
| BO-6 | Serve international markets first, US as secondary with proper tax compliance | 60%+ revenue from non-US markets initially |
| BO-7 | Scale revenue through SEO, ads, and pricing optimization | 15% MoM revenue growth target |

---

## 3. Scope

### 3.1 In Scope

- Shopify store provisioning and lifecycle management (via Shopify Partners API)
- Brand identity and niche template system
- AI-generated design assets (Midjourney pipeline)
- POD provider integration (Printful, Printify, Gooten, SPOD)
- Centralized multi-store management dashboard
- Order routing and fulfillment automation
- Financial reporting, unit economics tracking, fee reconciliation
- Tax compliance (sales tax, VAT/GST calculation and remittance)
- SEO optimization, ad management, pricing rules
- Audit logging and governance
- Two launch flows: automated and guided manual

### 3.2 Out of Scope

- Etsy marketplace (removed entirely)
- Physical inventory / warehousing
- Non-POD product sourcing
- Anti-detection, proxy rotation, fingerprint manipulation (prohibited)
- Identity renting or third-party account holder schemes (prohibited)
- Marketplaces beyond Shopify (Amazon, eBay -- future consideration)
- Customer service chatbot (future phase)
- Native mobile app (web responsive only)

---

## 4. System Architecture Overview

```
+------------------------------------------------------+
|           CENTRAL MANAGEMENT DASHBOARD                |
|         (Multi-store admin, analytics, finance)       |
+------------------------------------------------------+
        |            |            |            |
   +--------+  +--------+  +--------+  +--------+
   | Store  |  | Brand/ |  | Design |  | Growth |
   |Factory |  | Niche  |  |Pipeline|  | Engine |
   +--------+  +--------+  +--------+  +--------+
        |            |            |            |
+------------------------------------------------------+
|              ORCHESTRATION LAYER                      |
|     (Job queue, rate limiter, event bus)              |
+------------------------------------------------------+
        |            |            |            |
   +--------+  +--------+  +--------+  +--------+
   |Shopify |  |  POD   |  |  Tax   |  |Payment |
   |  API   |  |  APIs  |  | Engine |  |  APIs  |
   +--------+  +--------+  +--------+  +--------+
```

**All stores** are created under a **single Shopify Partners account** tied to one legal entity. The Orchestration Layer manages API rate limits, job scheduling, and event-driven workflows without any evasion or circumvention tactics.

---

## 5. Core Modules

### Module A: Store Factory

**Purpose:** Automate the provisioning, configuration, and lifecycle management of Shopify stores under a single Shopify Partners account.

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| SF-001 | Provision new Shopify stores via approved Shopify method: **Default:** guided/manual creation in Partner Dashboard. **Optional:** programmatic provisioning ONLY if Shopify provides an approved API / written confirmation. (No circumvention; all stores owned by the same legal entity) | P0 |
| SF-002 | Assign unique brand identity (name, domain, theme, logo) per store | P0 |
| SF-003 | Auto-configure payment gateway (Shopify Payments) per store | P0 |
| SF-004 | Auto-configure shipping profiles per store (based on POD provider locations) | P0 |
| SF-005 | Auto-install required Shopify apps (reviews, email capture, analytics) | P1 |
| SF-006 | Store lifecycle states: Draft, QA, Live, Paused, Archived | P0 |
| SF-007 | Store cloning -- replicate a successful store configuration as a template | P1 |
| SF-008 | Custom domain assignment and DNS configuration per store | P1 |
| SF-009 | Store-level feature flags (enable/disable ads, specific POD providers, etc.) | P2 |
| SF-010 | Bulk store creation from a niche/brand queue | P1 |

#### KPIs

| KPI | Target |
|-----|--------|
| Average time from approval to live store | < 2 hours (automated), < 1 day (guided) |
| Store creation success rate | > 98% |
| Stores launched per month | 10+ by Month 3, 20+ by Month 6 |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Shopify Partners API rate limits | Queue-based throttling, respect published limits |
| Shopify policy limits on stores per partner | Pre-validate with Shopify Partner support; monitor policy changes |
| Store configuration drift over time | Periodic reconciliation job comparing live config vs. template |
| No approved API for programmatic store creation | Automation deferred; guided/manual remains primary provisioning method until Shopify confirms an approved programmatic path |

---

### Module B: Brand/Niche Template System

**Purpose:** Provide a library of pre-built brand identities and niche configurations that can be applied to new stores, ensuring each store has a distinct market presence.

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| BN-001 | Niche catalog with metadata (keywords, audience, margin profile, competition level) | P0 |
| BN-002 | Brand template packages (theme preset, color palette, typography, tone of voice) | P1 |
| BN-003 | Auto-generated store copy (About page, policies, product descriptions) per niche | P1 |
| BN-004 | Theme selection and customization per niche (from Shopify theme library) | P1 |
| BN-005 | Niche performance scoring based on historical data (sales, margins, return rate) | P1 |
| BN-006 | Seasonal niche recommendations (holidays, events, trends) | P2 |
| BN-007 | Brand asset package export (logo, banner, social media kit) per store | P1 |

#### KPIs

| KPI | Target |
|-----|--------|
| Niches available in template library | 20+ by Month 6 |
| Brand template application time | < 15 minutes per store |
| Niche-to-store conversion (templates used vs. stores launched) | > 80% |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Niche saturation (too many stores in same niche) | Niche cap per category; diversification rules |
| Brand templates look too similar across stores | Require minimum differentiation score before approval |

---

### Module C: Design Generation Pipeline

**Purpose:** Generate high-quality visual assets (logos, banners, product mockups, brand style kits) using Midjourney, with quality gates and fallback paths.

#### Asset Types

| Asset | Description | Required Per |
|-------|------------|-------------|
| Logo | Primary brand logo, multiple formats (SVG, PNG) | Store |
| Banner | Hero banner for store homepage | Store |
| Product Mockups | Lifestyle mockups for each product category | Product |
| Brand Style Kit | Color palette, typography samples, mood board | Store |
| Social Media Kit | Profile images, cover photos for Pinterest/Instagram | Store (optional) |

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| DG-001 | Accept niche + brand parameters as input (niche keywords, style direction, color preferences, target audience) | P1 |
| DG-002 | Generate logo candidates (minimum 3 variations per request) | P1 |
| DG-003 | Generate banner images matched to store theme and niche | P1 |
| DG-004 | Generate product mockup images for POD catalog items | P1 |
| DG-005 | Quality gate: automated scoring (resolution, brand alignment, text legibility) | P1 |
| DG-006 | Quality gate: manual review queue for assets that fail automated scoring | P1 |
| DG-007 | Fallback path: if Midjourney assets fail QA after 2 attempts, route to stock photo library or manual designer queue | P1 |
| DG-008 | Asset storage and versioning (link assets to store and product records) | P1 |
| DG-009 | Batch generation for new store launch (all required assets in one job) | P2 |
| DG-010 | Style consistency enforcement (assets for same store must share visual language) | P2 |

#### Input Parameters Per Niche

| Parameter | Example |
|-----------|---------|
| Niche category | "Home Decor -- Minimalist" |
| Target audience | "Women 25-45, urban, design-conscious" |
| Color palette preference | "Earth tones", "Pastel", "Bold primary" |
| Style direction | "Scandinavian", "Boho", "Industrial" |
| Brand name | "Nordic Nest Co." |
| Mood keywords | "calm, natural, spacious" |

#### KPIs

| KPI | Target |
|-----|--------|
| Assets passing automated QA on first generation | > 70% |
| Average time from request to approved assets | < 4 hours |
| Fallback rate (routed to manual/stock) | < 20% |
| Cost per asset set per store | < $5 |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Midjourney API availability / changes | Fallback to DALL-E or stock photo pipeline |
| Generated assets contain copyrighted elements | Automated reverse image search check before approval |
| Quality inconsistency across batches | Style reference images anchored per niche template |

---

### Module D: POD Integration Layer

**Purpose:** Connect all stores to Print-on-Demand providers for zero-inventory fulfillment with intelligent order routing.

#### Supported Providers

| Provider | Products | Priority | Avg. Production Time |
|----------|----------|----------|---------------------|
| Printful | Apparel, Home & Living, Accessories | P0 | 2-5 business days |
| Printify | Apparel, Home, Office, Accessories | P0 | 2-7 business days |
| Gooten | Apparel, Home, Photo products | P2 | 3-8 business days |
| SPOD | Apparel (fast production) | P2 | 48 hours |

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| POD-001 | Multi-provider product catalog aggregation | P0 |
| POD-002 | Smart order routing (cheapest / fastest / closest to customer) | P0 |
| POD-003 | Design file management and linking to products | P0 |
| POD-004 | Mockup generation from design files for product listings | P0 |
| POD-005 | Automatic order forwarding from Shopify to selected POD provider | P0 |
| POD-006 | Shipment tracking sync from POD provider back to Shopify order | P0 |
| POD-007 | Cost calculator with margin analysis per product per provider | P0 |
| POD-008 | Fallback routing if primary POD provider is out of stock or delayed | P1 |
| POD-009 | Sample ordering system for quality control | P1 |
| POD-010 | Provider health monitoring (uptime, production delays, error rates) | P1 |

#### Order Flow

```
Customer Order (Shopify)
        |
        v
  Order Ingestion (webhook)
        |
        v
  POD Router (select best provider by cost/speed/location)
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
  Tracking Number Sync to Shopify
        |
        v
  Customer Delivery
        |
        v
  Review Request Email
```

#### KPIs

| KPI | Target |
|-----|--------|
| Order-to-POD-submission time | < 5 minutes |
| Order fulfillment automation rate | > 98% |
| Average production + ship time | < 7 business days |
| POD routing cost savings vs. single-provider | > 10% |

#### Risks

| Risk | Mitigation |
|------|-----------|
| POD provider API downtime | Multi-provider fallback; order queue with retry |
| Quality inconsistency across providers | Sample testing per product per provider; provider scorecards |
| Shipping delays impact customer satisfaction | Proactive delay notifications; provider SLA monitoring |

---

### Module E: Central Management Dashboard

**Purpose:** A single admin interface to manage all Shopify stores, orders, finances, and operations.

#### Dashboard Sections

**Store Overview**

| ID | Requirement | Priority |
|----|------------|----------|
| DB-001 | Grid/list view of all stores with status indicators (Draft, QA, Live, Paused) | P0 |
| DB-002 | Store health score (composite of sales, margins, return rate, policy compliance) | P0 |
| DB-003 | Quick actions: pause store, add listings, view analytics, open Shopify admin | P0 |
| DB-004 | Store grouping and filtering by niche, performance tier, launch date | P1 |
| DB-005 | Store creation wizard launch (automated or guided) | P0 |

**Order Management**

| ID | Requirement | Priority |
|----|------------|----------|
| DB-010 | Unified order feed from all Shopify stores | P0 |
| DB-011 | Order status tracking (pending, production, shipped, delivered) | P0 |
| DB-012 | Bulk order actions (fulfill, cancel, refund) | P0 |
| DB-013 | Order issue flagging and resolution workflow | P1 |
| DB-014 | Returns and disputes management | P1 |

**Financial Overview**

| ID | Requirement | Priority |
|----|------------|----------|
| DB-020 | Revenue by store, niche, time period | P0 |
| DB-021 | Profit margin calculator (revenue - POD cost - Shopify fees - tax - ads) | P0 |
| DB-022 | Fee tracking (Shopify subscription, transaction fees, app fees) | P0 |
| DB-023 | Cash flow view (payouts from Shopify Payments schedule) | P1 |

**Analytics & Reports**

| ID | Requirement | Priority |
|----|------------|----------|
| DB-030 | Sales trends (daily, weekly, monthly) per store and aggregate | P0 |
| DB-031 | Best-selling products and niches | P0 |
| DB-032 | Conversion rate tracking per store | P1 |
| DB-033 | Traffic source breakdown | P1 |
| DB-034 | Custom report builder and CSV export | P2 |

**Notifications**

| ID | Requirement | Priority |
|----|------------|----------|
| DB-040 | Real-time alerts for store policy warnings | P0 |
| DB-041 | Order issue notifications | P0 |
| DB-042 | Configurable channels (email, Slack, Telegram) | P1 |

#### KPIs

| KPI | Target |
|-----|--------|
| Dashboard page load time | < 2 seconds |
| Data freshness (order/sales sync lag) | < 5 minutes |
| Admin task completion time (common workflows) | 50% faster than Shopify native admin |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Dashboard becomes bottleneck at scale | Pagination, lazy loading, server-side aggregation |
| Data inconsistency between dashboard and Shopify | Webhook-driven sync + periodic reconciliation |

---

### Module F: Finance & Reporting

**Purpose:** Track unit economics, fees, taxes, and profitability across all stores with accuracy suitable for accounting and tax filing.

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| FN-001 | Per-order P&L calculation (sale price - POD cost - shipping - Shopify fees - tax remitted - ad spend) | P0 |
| FN-002 | Per-store monthly P&L statement | P0 |
| FN-003 | Aggregate company-level P&L | P0 |
| FN-004 | Shopify fee reconciliation (subscription, transaction, app charges) | P0 |
| FN-005 | POD cost tracking per order per provider | P0 |
| FN-006 | Ad spend tracking and ROAS per store per campaign | P1 |
| FN-007 | Payout schedule tracking (Shopify Payments disbursement) | P1 |
| FN-008 | Multi-currency support (USD, EUR, GBP, AUD, CAD, ILS) | P1 |
| FN-009 | Export to accounting software format (QuickBooks, Xero) | P1 |
| FN-010 | Tax collected vs. tax remitted reconciliation report | P0 |

#### KPIs

| KPI | Target |
|-----|--------|
| Financial data accuracy (vs. Shopify records) | 99.9% |
| Monthly close time (all reports generated) | < 2 business days after month end |
| Tax reconciliation discrepancy | < 0.1% |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Currency fluctuation affecting margin calculations | Lock exchange rate at order time; daily rate updates |
| Shopify fee structure changes | Fee abstraction layer; monitor Shopify changelog |

---

### Module G: Compliance & Governance

**Purpose:** Ensure all stores operate within Shopify policies, applicable tax law, intellectual property rules, and data privacy regulations. Maintain a complete audit trail.

#### Functional Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| CG-001 | Pre-publish compliance check: verify listing content against Shopify Acceptable Use Policy | P0 |
| CG-002 | Automated policy monitoring for Shopify ToS changes | P0 |
| CG-003 | Product IP screening (trademark/copyright check before publishing) | P1 |
| CG-004 | PII handling compliant with GDPR (EU customers) and applicable privacy laws | P0 |
| CG-005 | Audit log of all administrative actions (who, what, when, which store) | P0 |
| CG-006 | Role-based access control (Owner, Manager, Viewer) | P0 |
| CG-007 | Data retention policy enforcement (configurable per data type) | P1 |
| CG-008 | Shopify Partner Program compliance monitoring | P0 |
| CG-009 | Consumer protection compliance (refund policies, delivery promises per jurisdiction) | P1 |
| CG-010 | Annual compliance review checklist generator | P2 |

#### KPIs

| KPI | Target |
|-----|--------|
| Shopify policy violations | Zero |
| Audit log coverage | 100% of admin actions |
| IP screening pass rate before publish | 100% of listings screened |
| GDPR data subject requests fulfilled within SLA | 100% within 30 days |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Shopify changes partner program terms | Dedicated monitoring; legal review quarterly |
| IP infringement claim on generated designs | Pre-publish screening; immediate takedown process; insurance |
| GDPR non-compliance fine | Privacy-by-design; DPO designation; regular audits |

---

### Module H: Growth Engine

**Purpose:** Maximize revenue across all stores through SEO, advertising, and pricing optimization.

#### Functional Requirements

**SEO**

| ID | Requirement | Priority |
|----|------------|----------|
| GR-001 | Keyword research tool (per niche, per market) | P1 |
| GR-002 | Auto-optimized product titles, descriptions, meta tags | P1 |
| GR-003 | Structured data / schema markup automation | P1 |
| GR-004 | Sitemap generation and Google Search Console integration | P1 |
| GR-005 | Content performance tracking (organic traffic, rankings) | P2 |

**Advertising**

| ID | Requirement | Priority |
|----|------------|----------|
| GR-010 | Google Shopping feed generation per store | P1 |
| GR-011 | Facebook/Meta Ads integration (catalog sync, pixel) | P1 |
| GR-012 | Ad budget allocation across stores based on ROAS | P1 |
| GR-013 | Underperforming campaign auto-pause rules | P1 |
| GR-014 | Pinterest auto-posting from product catalog | P2 |

**Pricing**

| ID | Requirement | Priority |
|----|------------|----------|
| GR-020 | Pricing rules engine (floor price, ceiling, target margin) | P1 |
| GR-021 | Competitor price monitoring (manual input, future: automated) | P2 |
| GR-022 | Sale / discount automation (seasonal, clearance) | P2 |

#### KPIs

| KPI | Target |
|-----|--------|
| Organic traffic share (vs. paid) | > 40% by Month 12 |
| Blended ROAS across all paid channels | > 3.0x |
| Average conversion rate per store | > 2% |
| SEO-optimized listings (passing all checks) | > 95% |

#### Risks

| Risk | Mitigation |
|------|-----------|
| Ad spend exceeds returns during ramp-up | Daily budget caps; auto-pause at negative ROAS threshold |
| Google/Meta policy changes affecting ads | Multi-channel diversification; organic traffic investment |

---

## 6. Tax Strategy

### 6.1 Operating Model Assumptions

- **Legal entity:** One company (likely registered outside the US -- e.g., Israel or UK) owns and operates all stores.
- **International-first:** Primary target markets are EU, UK, Australia, Canada. US is a secondary market.
- **No physical presence in the US:** No office, employees, warehouse, or inventory in any US state.
- **Fulfillment by third-party POD providers:** POD providers ship from their own facilities. The company does not control or direct fulfillment locations.
- **Payments:**
  - Primary: Shopify Payments ONLY if the company's European country is supported for Shopify Payments
  - Fallback: third-party gateway (e.g., Stripe / Adyen / PayPal) per store where Shopify Payments is unavailable or restricted
  - The platform must support both modes.

### 6.2 US Sales Tax

**Nexus Analysis:**

- **Physical nexus:** None. No employees, offices, or owned inventory in the US.
- **Economic nexus:** May be triggered state-by-state based on sales volume/revenue thresholds (typically $100K revenue or 200 transactions per state per year). Must be monitored per store and in aggregate for the legal entity.
- **Marketplace facilitator:** Does NOT apply -- Shopify is not a marketplace facilitator for custom stores. The company is the seller of record.

**Required Capabilities:**

| ID | Capability | Priority |
|----|-----------|----------|
| TX-001 | Real-time sales tax calculation at checkout (via tax engine integration) | P0 |
| TX-002 | Economic nexus threshold monitoring per US state (aggregate across all stores) | P0 |
| TX-003 | State-by-state sales tracking dashboard | P0 |
| TX-004 | Tax registration tracking (which states we are registered to collect in) | P0 |
| TX-005 | Automated tax remittance filing (via tax engine or accountant export) | P1 |
| TX-006 | Exemption certificate management (if B2B sales arise) | P2 |

### 6.3 International Tax (VAT / GST)

| Market | Obligation | Threshold |
|--------|-----------|-----------|
| **EU** | VAT on B2C sales (EU VAT e-commerce package, OSS scheme) | EUR 10,000 aggregate to all EU states |
| **UK** | VAT registration required if selling to UK consumers | GBP 0 (no threshold for non-UK sellers) |
| **Australia** | GST on sales to AU consumers | AUD 75,000 |
| **Canada** | GST/HST; varies by province | CAD 30,000 |

**Required Capabilities:**

| ID | Capability | Priority |
|----|-----------|----------|
| TX-010 | VAT/GST calculation at checkout per jurisdiction | P1 |
| TX-011 | VAT registration status tracking per country | P1 |
| TX-012 | OSS (One-Stop Shop) reporting for EU sales | P1 |
| TX-013 | Tax-inclusive pricing display for EU/UK/AU markets | P1 |

### 6.4 What the Platform Handles vs. Third-Party

| Responsibility | Platform | Third-Party (TaxJar/Avalara) | Accountant |
|---------------|----------|------------------------------|-----------|
| Tax rate lookup at checkout | Integrates | Provides rates | -- |
| Nexus threshold monitoring | Dashboard + alerts | Data source | Reviews |
| Tax registration filing | Tracking only | May assist | Files |
| Tax remittance | Export reports | Auto-file (optional) | Reviews + files |
| Tax strategy decisions | -- | -- | Advises |

### 6.5 Tax Red Lines

**Actions we will NOT take:**

1. We will NOT misrepresent the location of the business entity to reduce tax obligations.
2. We will NOT structure stores as separate legal entities solely to stay below nexus thresholds.
3. We will NOT disable tax collection in jurisdictions where we have met economic nexus thresholds.
4. We will NOT misclassify products to obtain lower tax rates.
5. We will NOT delay tax registration beyond the legally required timeline after crossing a threshold.
6. We will NOT use customer location data inaccurately to alter tax calculations.

---

## 7. Launch Flows

### 7.1 Automated Launch Flow (Zero-Touch After Approval)

```
INPUTS                      GATES                       OUTPUTS
-----------                 -----------                 -----------
Niche selection      -->    [Niche approved?]      -->  Store provisioned
Brand template       -->    [Brand assets ready?]  -->  Theme + branding applied
Product catalog      -->    [POD mapping valid?]   -->  Products published
                            [Tax config set?]      -->  Tax engine active
                            [Payments configured?] -->  Payment gateway live
                            [Policies published?]  -->  Legal pages live
                            [Test order passed?]   -->  Store goes LIVE
```

**Steps:**

1. Admin selects niche from catalog and approves launch.
2. System assigns brand template, generates assets (Module C), provisions Shopify store (Module A).
3. System maps product catalog from POD provider (Module D), applies pricing rules (Module H).
4. System configures tax engine, payment gateway, shipping profiles.
5. System generates legal pages (privacy policy, refund policy, terms of service).
6. System runs automated QA: places test order, verifies fulfillment routing, checks all pages load.
7. **All gates pass --> store status set to Live.**
8. If any gate fails --> store held in QA status, alert sent to admin.

### 7.2 Guided Manual Launch Flow (Human-in-the-Loop)

**Checklist with human approvals at each stage:**

| Step | Action | Owner | Approval Required |
|------|--------|-------|-------------------|
| 1 | Select niche and review market data | Admin | Yes |
| 2 | Review and customize brand template (name, colors, copy) | Admin | Yes |
| 3 | Review generated design assets (logo, banner, mockups) | Admin | Yes -- reject/regenerate if needed |
| 4 | Review product catalog and pricing | Admin | Yes |
| 5 | Verify POD provider mapping and sample order | Admin | Yes |
| 6 | Configure tax settings and verify jurisdiction coverage | Admin | Yes |
| 7 | Configure payment gateway | Admin | Yes |
| 8 | Review legal pages and store policies | Admin | Yes |
| 9 | Place test order and verify end-to-end flow | Admin | Yes |
| 10 | Final review and go-live approval | Admin | Yes -- store goes Live |

### 7.3 Go-Live Gating Checks (Both Flows)

| Gate | Criteria | Blocking? |
|------|----------|-----------|
| Brand assets complete | Logo, banner, product mockups all approved | Yes |
| POD mapping valid | Every product linked to at least one POD provider + design file | Yes |
| Tax configuration set | Tax engine active, jurisdictions configured | Yes |
| Payments configured | Shopify Payments verified OR approved third-party gateway (Stripe / Adyen / PayPal) configured and tested | Yes |
| Policies published | Privacy policy, refund policy, terms of service pages live | Yes |
| Test order passed | End-to-end order placed, routed to POD, tracking returned | Yes |
| Domain configured | Custom domain active with SSL | No (can launch on .myshopify.com) |
| SEO baseline set | Meta titles, descriptions, sitemap submitted | No (can optimize post-launch) |

---

## 8. Data Model

### 8.1 Core Entities

```
+------------------+       +------------------+       +------------------+
|    COMPANY       |       |      STORE       |       |     BRAND        |
+------------------+       +------------------+       +------------------+
| id               |<----->| id               |<----->| id               |
| legal_name       |  1:N  | company_id       |  1:1  | store_id         |
| registration_num |       | brand_id         |       | name             |
| country          |       | shopify_store_id |       | logo_url         |
| tax_ids{}        |       | niche_id         |       | banner_url       |
| billing_email    |       | status           |       | color_palette    |
| created_at       |       | domain           |       | typography       |
+------------------+       | health_score     |       | tone_of_voice    |
                           | launched_at      |       | style_direction  |
                           | created_at       |       +------------------+
                           +------------------+

+------------------+       +------------------+       +------------------+
|     NICHE        |       |    PRODUCT       |       |  DESIGN_ASSET    |
+------------------+       +------------------+       +------------------+
| id               |       | id               |       | id               |
| name             |       | store_id         |       | store_id         |
| keywords[]       |       | title            |       | product_id (opt) |
| target_audience  |       | description      |       | asset_type       |
| avg_margin       |       | price            |       | file_url         |
| competition_level|       | cost (POD)       |       | source (MJ/stock)|
| trending_score   |       | pod_provider_id  |       | qa_status        |
| template_id      |       | design_asset_id  |       | version          |
+------------------+       | shopify_product_id|      | created_at       |
                           | status           |       +------------------+
                           | tags[]           |
                           +------------------+

+------------------+       +------------------+       +------------------+
|  SUPPLIER_POD    |       |     ORDER        |       |  FINANCE_RECORD  |
+------------------+       +------------------+       +------------------+
| id               |       | id               |       | id               |
| name             |       | store_id         |       | order_id         |
| api_type         |       | shopify_order_id |       | sale_amount      |
| products_catalog |       | product_id       |       | pod_cost         |
| avg_prod_time    |       | pod_provider_id  |       | shipping_cost    |
| health_score     |       | pod_order_id     |       | platform_fees    |
| status           |       | customer_email   |       | tax_collected    |
+------------------+       | amount           |       | ad_spend_alloc   |
                           | pod_cost         |       | net_profit       |
                           | tracking_number  |       | currency         |
                           | status           |       | created_at       |
                           | created_at       |       +------------------+
                           +------------------+

+------------------+       +------------------+       +------------------+
|   TAX_RECORD     |       |   USER_ADMIN     |       |  AUDIT_EVENT     |
+------------------+       +------------------+       +------------------+
| id               |       | id               |       | id               |
| order_id         |       | email            |       | user_id          |
| jurisdiction     |       | name             |       | action           |
| tax_type         |       | role (owner/     |       | entity_type      |
| tax_rate         |       |   manager/viewer)|       | entity_id        |
| tax_amount       |       | mfa_enabled      |       | details{}        |
| remittance_status|       | last_login       |       | ip_address       |
| period           |       | created_at       |       | timestamp        |
+------------------+       +------------------+       +------------------+
```

### 8.2 Key Relationships

- **Company 1:N Store** -- one company owns all stores.
- **Store 1:1 Brand** -- each store has one brand identity.
- **Store N:1 Niche** -- many stores can share a niche.
- **Store 1:N Product** -- one store has many products.
- **Product N:1 Supplier_POD** -- products fulfilled by one POD provider (with fallback).
- **Product 1:1 Design_Asset** -- each product has a primary design asset.
- **Store 1:N Order** -- one store receives many orders.
- **Order 1:1 Finance_Record** -- each order generates one financial record.
- **Order 1:1 Tax_Record** -- each order generates one tax record.
- **User_Admin N:N Store** -- admins can manage multiple stores; stores can have multiple admins.
- **All entities generate Audit_Events.**

---

## 9. Integrations

| Integration | API | Usage | Priority |
|------------|-----|-------|----------|
| **Shopify Admin API** | REST + GraphQL | Store creation, product management, order management, theme config | P0 |
| **Shopify Partners API** | GraphQL | Store provisioning, app installation, billing | P0 |
| **Printful API** | REST v2, OAuth 2.0 | Product catalog, order submission, tracking | P0 |
| **Printify API** | REST v1, API Key | Product catalog, order submission, tracking | P0 |
| **Gooten API** | REST, API Key | Product catalog, order submission, tracking | P2 |
| **SPOD API** | REST, API Key | Product catalog, order submission, tracking | P2 |
| **Midjourney** | (via Discord API or future official API) | Design asset generation | P1 |
| **TaxJar or Avalara** | REST | Tax rate calculation, nexus monitoring, filing | P0 |
| **Google Search Console** | REST | Sitemap submission, indexing status | P1 |
| **Google Merchant Center** | Content API | Shopping feed management | P1 |
| **Meta Marketing API** | Graph API | Catalog sync, pixel events, ad management | P1 |
| **Email (Transactional)** | SendGrid / Postmark | Order confirmations, review requests, admin alerts | P1 |
| **Slack / Telegram** | Webhook / Bot API | Admin notifications | P1 |
| **Analytics** | Google Analytics 4 (Measurement Protocol) | Traffic and conversion tracking | P1 |

---

## 10. Security & Privacy

| ID | Requirement | Priority |
|----|------------|----------|
| SEC-001 | TLS 1.3 for all API communications | P0 |
| SEC-002 | API keys and secrets stored in encrypted vault (e.g., AWS Secrets Manager, Vault) | P0 |
| SEC-003 | Role-based access control (Owner, Manager, Viewer) enforced at API and UI level | P0 |
| SEC-004 | Multi-factor authentication for all admin accounts | P0 |
| SEC-005 | Audit log of all administrative actions (immutable, append-only) | P0 |
| SEC-006 | Customer PII (email, address) encrypted at rest (AES-256) | P0 |
| SEC-007 | GDPR compliance: data subject access/deletion requests supported | P0 |
| SEC-008 | No customer PII stored beyond what is needed for order fulfillment + legal retention | P0 |
| SEC-009 | API key rotation every 90 days (automated reminders) | P1 |
| SEC-010 | Automated dependency vulnerability scanning in CI/CD | P1 |
| SEC-011 | Principle of least privilege for all service accounts | P0 |
| SEC-012 | Incident response plan documented and tested | P1 |

---

## 11. Revenue Model & Unit Economics

### 11.1 Revenue Streams

| Stream | Description |
|--------|------------|
| Product Sales (Shopify) | Direct sales from all Shopify stores minus costs |

### 11.2 Cost Structure

| Cost Item | Typical % of Sale |
|-----------|------------------|
| POD Production + Shipping | 30-40% |
| Shopify Subscription (per store) | Fixed monthly ($39/store on Basic, or Shopify Plus for volume) |
| Shopify Transaction + Processing Fees | 2.6-2.9% + $0.30 per transaction |
| Shopify App Fees | Fixed monthly per app per store |
| Ad Spend (Google, Meta, Pinterest) | 5-15% of revenue (variable) |
| Tax Engine Subscription (TaxJar/Avalara) | Fixed monthly |
| Midjourney / Design Generation | < 1% of revenue |
| Platform Hosting & Infrastructure | Fixed monthly |

### 11.3 Unit Economics Per Order (Example)

```
Average Selling Price:                $35.00
  - POD Cost (production + shipping): -$13.00  (37%)
  - Shopify Transaction Fee (~3%):    -$1.05   (3%)
  - Payment Processing (~2.9%+$0.30): -$1.32   (3.8%)
  - Ad Spend Allocation (~10%):       -$3.50   (10%)
  - Tax Engine (allocated):           -$0.05   (<1%)
  ----------------------------------------
  Gross Profit per Order:             $16.08   (45.9%)

  Monthly Fixed Costs per Store:
    Shopify Basic:     $39
    Apps (est.):       $30
    Design amortized:  $10
    ----------------------
    Total:             $79/store/month

  Break-even per store: ~5 orders/month
```

### 11.4 Scale Economics

| Metric | 50 Stores | 100 Stores | 200 Stores |
|--------|-----------|------------|------------|
| Monthly Orders (est. 100/store) | 5,000 | 10,000 | 20,000 |
| Monthly Revenue | $175,000 | $350,000 | $700,000 |
| Gross Profit (45%) | $80,000 | $160,000 | $322,000 |
| Fixed Costs (stores + infra) | $6,000 | $11,000 | $20,000 |
| **Net Profit (est.)** | **$74,000** | **$149,000** | **$302,000** |

---

## 12. Risk Assessment

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|-----------|
| 1 | Shopify Partner program limits number of stores per partner | Medium | Critical | Pre-validate with Shopify; consider Shopify Plus partner agreement |
| 2 | POD provider quality or reliability issues | Medium | High | Multi-provider fallback; sample testing; provider SLAs |
| 3 | Economic nexus triggers in multiple US states simultaneously | Medium | Medium | Automated monitoring; proactive registration; tax engine |
| 4 | Midjourney changes API access or pricing | Medium | Medium | Fallback to DALL-E / stock assets; asset library |
| 5 | Generated designs infringe IP | Low | High | Pre-publish screening; reverse image search; takedown SOP |
| 6 | Shopify fee increases | Medium | Medium | Margin buffer; Shopify Plus negotiation at scale |
| 7 | Google/Meta ad policy changes | Medium | Medium | Channel diversification; organic traffic investment |
| 8 | Data breach (customer PII) | Low | Critical | Encryption, access controls, audit logs, incident response plan |
| 9 | Currency fluctuation (multi-currency sales) | Medium | Low | Lock rates at order time; periodic repricing |
| 10 | Competitor replicates the model | High | Medium | Speed to scale; proprietary niche data; operational excellence |

---

## 13. Rollout Phases

### Phase 1: Foundation (Months 1-3)

- Store Factory (automated provisioning via Shopify Partners API)
- Single POD integration (Printful)
- Central dashboard (store list, order feed, basic financials)
- Tax engine integration (TaxJar or Avalara)
- Audit logging and RBAC
- 5 initial niches with manual brand setup

**Target:** 10 live stores, positive unit economics on 5+

### Phase 2: Automation & Branding (Months 4-6)

- Brand/Niche template system
- Midjourney design generation pipeline
- Second POD provider (Printify)
- SEO automation (titles, meta, schema)
- Guided manual launch flow
- Automated launch flow (zero-touch)
- Financial reporting (per-store P&L)
- Nexus monitoring dashboard

**Target:** 30 live stores, 15+ niches, automated launch < 2 hours

### Phase 3: Scale (Months 7-9)

- Google Shopping + Meta Ads integration
- Pricing rules engine
- Advanced analytics (conversion, traffic source, niche performance)
- Additional POD providers (Gooten, SPOD)
- Store cloning and bulk launch
- Multi-currency support

**Target:** 75 live stores, ROAS > 3x on paid channels

### Phase 4: Optimization (Months 10-12)

- Dynamic pricing intelligence
- Social media auto-posting (Pinterest, Instagram)
- Custom report builder
- Competitor monitoring
- Advanced financial forecasting
- Accounting software export (QuickBooks, Xero)

**Target:** 100+ live stores, $500K+ monthly revenue, 40%+ net margin

---

## 14. Success Metrics / KPIs

### 14.1 Business KPIs

| KPI | Month 3 | Month 6 | Month 12 |
|-----|---------|---------|----------|
| Live stores | 10 | 30 | 100+ |
| Monthly revenue | $20K | $100K | $500K+ |
| Net profit margin | 25%+ | 35%+ | 40%+ |
| Orders per day | 50 | 300 | 1,500+ |
| Shopify policy violations | 0 | 0 | 0 |

### 14.2 Operational KPIs

| KPI | Target |
|-----|--------|
| Store launch automation rate | > 90% (zero-touch) |
| Order fulfillment automation rate | > 98% |
| Average order-to-ship time | < 5 business days |
| Platform uptime | 99.9% |
| Dashboard API response time | < 500ms |
| Tax calculation accuracy | 100% |

### 14.3 Growth KPIs

| KPI | Target |
|-----|--------|
| Organic traffic share | > 40% by Month 12 |
| Blended ROAS (paid channels) | > 3.0x |
| Average conversion rate per store | > 2% |
| Month-over-month revenue growth | > 15% |

---

## 15. Open Questions

Issues that must be resolved before or during Phase 1 build:

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | **Legal entity jurisdiction:** Where should the company be registered (Israel, UK, US Delaware, other)? Tax and liability implications per choice. | Legal counsel | Before Phase 1 |
| 2 | **Shopify Partners store limits:** Is there a formal or practical limit on the number of stores one Shopify Partner account can manage? Need written confirmation from Shopify. | Shopify Partner Manager | Before Phase 1 |
| 3 | **Shopify Plus vs. Basic plans:** At what store count does Shopify Plus (or a custom enterprise deal) become necessary/cost-effective? | Finance + Shopify | Before Phase 2 |
| 4 | **Midjourney API access:** Midjourney does not currently offer an official API. Current approach relies on Discord automation or third-party wrappers. When will an official API be available? Fallback? | Engineering | Before Phase 2 |
| 5 | **Tax engine selection:** TaxJar vs. Avalara -- which is better suited for international (non-US entity) selling into US + EU + UK + AU + CA? | Finance + Legal | Before Phase 1 |
| 6 | **VAT/GST registration timing:** When exactly must we register for VAT in the UK (zero threshold for non-UK sellers) and EU OSS? Before first sale or after? | Tax advisor | Before Phase 1 |
| 7 | **POD provider agreements at scale:** Do Printful/Printify offer volume discounts or dedicated account management for high-volume partners? | Operations | Phase 1 |
| 8 | **Payment processing for non-US entity:** Can Shopify Payments be used by a non-US entity selling to US customers? Any restrictions? | Shopify + Legal | Before Phase 1 |
| 9 | **IP liability for AI-generated designs:** What is the company's legal exposure if a Midjourney-generated design unintentionally resembles a protected trademark or copyrighted work? | Legal counsel | Before Phase 2 |
| 10 | **Customer service model:** Who handles customer inquiries across 100+ stores? Shared inbox? AI-assisted? Outsourced? Not addressed in this BRD. | Operations | Phase 2 |
| 11 | **Refund/return policy standardization:** Should all stores share the same refund policy, or can policies vary by niche/product type? | Legal + Operations | Phase 1 |
| 12 | **Domain strategy:** Custom domains (.com) for every store? Subdomains? Cost and DNS management at scale? | Engineering | Phase 1 |
| 13 | **Store creation method:** Is there an approved programmatic method to create/provision Shopify stores at scale for a single legal entity? If not, confirm operationally acceptable manual workflow + any limits on number of stores per Partner account. | Engineering + Shopify Partner Manager | Before Phase 1 |

---

## 16. Glossary

| Term | Definition |
|------|-----------|
| **POD** | Print on Demand -- manufacturing model where products are only produced when ordered |
| **Store Factory** | Automated system for provisioning and configuring new Shopify stores |
| **Niche** | Specific product category/vertical a store focuses on (e.g., "Minimalist Home Decor") |
| **Brand Template** | Pre-built package of visual identity, copy, and theme configuration for a store |
| **Design Asset** | Visual file (logo, banner, mockup) used in store branding or product listings |
| **POD Router** | Logic that selects the optimal POD provider per order based on cost, speed, and location |
| **Store Health Score** | Composite metric measuring store performance (sales, margins, return rate, compliance) |
| **Economic Nexus** | US sales tax concept where sufficient sales volume/revenue in a state triggers tax collection obligation |
| **OSS** | One-Stop Shop -- EU VAT simplification scheme for cross-border B2C e-commerce |
| **ROAS** | Return on Ad Spend -- revenue generated per dollar spent on advertising |
| **Go-Live Gate** | Mandatory check that must pass before a store can be set to Live status |
| **QA Status** | Store lifecycle state where the store exists but has not yet passed all go-live checks |
| **RBAC** | Role-Based Access Control -- security model limiting actions based on user roles |
| **PII** | Personally Identifiable Information -- data that can identify an individual |
| **GDPR** | General Data Protection Regulation -- EU data privacy law |
| **Shopify Partners** | Shopify program allowing developers/agencies to create and manage stores on behalf of clients |
| **Midjourney** | AI image generation service used for creating brand and product design assets |
| **Tax Engine** | Third-party service (TaxJar, Avalara) that calculates, tracks, and helps remit sales tax/VAT |

---

*End of BRD -- SHOPIFY-SHOP-AUTO v2.0*
