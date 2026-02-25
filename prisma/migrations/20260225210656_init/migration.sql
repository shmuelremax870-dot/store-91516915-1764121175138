-- CreateEnum
CREATE TYPE "AccountHolderStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'PAUSED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('ETSY', 'SHOPIFY');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('CREATING', 'WARMING_UP', 'ACTIVE', 'PAUSED', 'SUSPENDED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD_OUT', 'PAUSED', 'REMOVED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "TorahFundStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CLAWED_BACK');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'BIT', 'PAYBOX', 'PAYPAL');

-- CreateEnum
CREATE TYPE "CompetitionLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ProxyStatus" AS ENUM ('ACTIVE', 'ROTATING', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ApiProvider" AS ENUM ('ETSY', 'SHOPIFY', 'PRINTFUL', 'PRINTIFY', 'GOOTEN', 'SPOD', 'PROXY', 'OPENROUTER', 'PAYMENT', 'OTHER');

-- CreateTable
CREATE TABLE "AccountHolder" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "teudatZehut" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "bankAccount" TEXT NOT NULL,
    "bankBranch" TEXT NOT NULL,
    "bitPhone" TEXT,
    "status" "AccountHolderStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "maxStores" INTEGER NOT NULL DEFAULT 5,
    "torahFundRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "totalEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountHolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeUrl" TEXT NOT NULL,
    "nicheId" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'CREATING',
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "etsyStoreId" TEXT,
    "shopifyStoreId" TEXT,
    "mirrorStoreId" TEXT,
    "listingCount" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "warmupWeek" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "podProviderId" TEXT,
    "podProductId" TEXT,
    "designFileUrl" TEXT,
    "etsyListingId" TEXT,
    "shopifyProductId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "tags" TEXT[],
    "category" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "favorites" INTEGER NOT NULL DEFAULT 0,
    "sales" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "productId" TEXT,
    "platform" "Platform" NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerAddress" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "podCost" DOUBLE PRECISION NOT NULL,
    "platformFees" DOUBLE PRECISION NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL,
    "podProvider" TEXT,
    "podOrderId" TEXT,
    "trackingNumber" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TorahFund" (
    "id" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "saleAmount" DOUBLE PRECISION NOT NULL,
    "fundRate" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "fundAmount" DOUBLE PRECISION NOT NULL,
    "status" "TorahFundStatus" NOT NULL DEFAULT 'PENDING',
    "payoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TorahFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "accountHolderId" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL,
    "amountIls" DOUBLE PRECISION NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niche" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "avgMargin" DOUBLE PRECISION NOT NULL,
    "competitionLevel" "CompetitionLevel" NOT NULL,
    "trendingScore" INTEGER NOT NULL DEFAULT 50,
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Niche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProxyProfile" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "proxyIp" TEXT NOT NULL,
    "proxyPort" INTEGER NOT NULL,
    "proxyUsername" TEXT NOT NULL,
    "proxyPassword" TEXT NOT NULL,
    "browserProfile" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "cookies" JSONB,
    "lastUsed" TIMESTAMP(3),
    "status" "ProxyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProxyProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiSecret" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "provider" "ApiProvider" NOT NULL,
    "apiKey" TEXT NOT NULL,
    "apiSecret" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "webhookSecret" TEXT,
    "metadata" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountHolder_teudatZehut_key" ON "AccountHolder"("teudatZehut");

-- CreateIndex
CREATE UNIQUE INDEX "AccountHolder_email_key" ON "AccountHolder"("email");

-- CreateIndex
CREATE INDEX "AccountHolder_status_idx" ON "AccountHolder"("status");

-- CreateIndex
CREATE INDEX "AccountHolder_city_idx" ON "AccountHolder"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Store_mirrorStoreId_key" ON "Store"("mirrorStoreId");

-- CreateIndex
CREATE INDEX "Store_accountHolderId_idx" ON "Store"("accountHolderId");

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");

-- CreateIndex
CREATE INDEX "Store_platform_idx" ON "Store"("platform");

-- CreateIndex
CREATE INDEX "Store_nicheId_idx" ON "Store"("nicheId");

-- CreateIndex
CREATE INDEX "Store_platform_status_idx" ON "Store"("platform", "status");

-- CreateIndex
CREATE INDEX "Product_storeId_idx" ON "Product"("storeId");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_storeId_status_idx" ON "Product"("storeId", "status");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_platform_idx" ON "Order"("platform");

-- CreateIndex
CREATE INDEX "Order_storeId_status_idx" ON "Order"("storeId", "status");

-- CreateIndex
CREATE INDEX "Order_orderNumber_idx" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TorahFund_orderId_key" ON "TorahFund"("orderId");

-- CreateIndex
CREATE INDEX "TorahFund_accountHolderId_idx" ON "TorahFund"("accountHolderId");

-- CreateIndex
CREATE INDEX "TorahFund_storeId_idx" ON "TorahFund"("storeId");

-- CreateIndex
CREATE INDEX "TorahFund_status_idx" ON "TorahFund"("status");

-- CreateIndex
CREATE INDEX "TorahFund_payoutId_idx" ON "TorahFund"("payoutId");

-- CreateIndex
CREATE INDEX "TorahFund_createdAt_idx" ON "TorahFund"("createdAt");

-- CreateIndex
CREATE INDEX "Payout_accountHolderId_idx" ON "Payout"("accountHolderId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_createdAt_idx" ON "Payout"("createdAt");

-- CreateIndex
CREATE INDEX "Niche_isActive_idx" ON "Niche"("isActive");

-- CreateIndex
CREATE INDEX "Niche_competitionLevel_idx" ON "Niche"("competitionLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ProxyProfile_storeId_key" ON "ProxyProfile"("storeId");

-- CreateIndex
CREATE INDEX "ProxyProfile_status_idx" ON "ProxyProfile"("status");

-- CreateIndex
CREATE INDEX "ApiSecret_provider_idx" ON "ApiSecret"("provider");

-- CreateIndex
CREATE INDEX "ApiSecret_isActive_idx" ON "ApiSecret"("isActive");

-- CreateIndex
CREATE INDEX "ApiSecret_provider_isActive_idx" ON "ApiSecret"("provider", "isActive");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_performedBy_idx" ON "AuditLog"("performedBy");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "AccountHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_nicheId_fkey" FOREIGN KEY ("nicheId") REFERENCES "Niche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_mirrorStoreId_fkey" FOREIGN KEY ("mirrorStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorahFund" ADD CONSTRAINT "TorahFund_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "AccountHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorahFund" ADD CONSTRAINT "TorahFund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorahFund" ADD CONSTRAINT "TorahFund_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TorahFund" ADD CONSTRAINT "TorahFund_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_accountHolderId_fkey" FOREIGN KEY ("accountHolderId") REFERENCES "AccountHolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProxyProfile" ADD CONSTRAINT "ProxyProfile_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
