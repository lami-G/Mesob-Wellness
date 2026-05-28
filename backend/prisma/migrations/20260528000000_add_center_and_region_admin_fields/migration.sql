-- AlterTable
ALTER TABLE "centers" ADD COLUMN "managerId" UUID,
ADD COLUMN "managerEmail" TEXT;

-- CreateTable
CREATE TABLE "region_admins" (
    "id" UUID NOT NULL,
    "region" TEXT NOT NULL,
    "adminId" UUID,
    "email" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "region_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "region_admins_region_key" ON "region_admins"("region");

-- CreateIndex
CREATE INDEX "region_admins_region_idx" ON "region_admins"("region");
