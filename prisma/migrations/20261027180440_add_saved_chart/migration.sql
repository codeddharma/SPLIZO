-- CreateEnum
CREATE TYPE "ChartMetric" AS ENUM ('income', 'expense');

-- CreateEnum
CREATE TYPE "ChartGroupBy" AS ENUM ('category', 'bucket', 'account', 'person', 'month');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('bar', 'donut', 'line');

-- CreateTable
CREATE TABLE "saved_charts" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metric" "ChartMetric" NOT NULL,
    "groupBy" "ChartGroupBy" NOT NULL,
    "chartType" "ChartType" NOT NULL,
    "rangeKey" TEXT NOT NULL,
    "rangeFrom" TIMESTAMP(3),
    "rangeTo" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_charts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_charts_householdId_idx" ON "saved_charts"("householdId");

-- AddForeignKey
ALTER TABLE "saved_charts" ADD CONSTRAINT "saved_charts_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
