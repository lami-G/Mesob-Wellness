/*
  Warnings:

  - The `severity` column on the `notifications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `approved_at` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `approved_by` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `calculated_at` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `is_nurse_approved` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `patient_id` on the `patient_conditions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `patient_conditions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[patientId]` on the table `patient_conditions` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `type` on the `notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `patientId` to the `patient_conditions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `patient_conditions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('APPOINTMENT_REMINDER', 'APPOINTMENT_CONFIRMED', 'APPOINTMENT_CANCELLED', 'SYSTEM_ALERT', 'WELLNESS_TIP', 'FEEDBACK_REQUEST', 'USER_REGISTRATION', 'DATA_ISSUE');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "patient_conditions" DROP CONSTRAINT "patient_conditions_approved_by_fkey";

-- DropForeignKey
ALTER TABLE "patient_conditions" DROP CONSTRAINT "patient_conditions_patient_id_fkey";

-- DropIndex
DROP INDEX "notifications_createdAt_idx";

-- DropIndex
DROP INDEX "patient_conditions_approved_at_idx";

-- DropIndex
DROP INDEX "patient_conditions_is_nurse_approved_idx";

-- DropIndex
DROP INDEX "patient_conditions_patient_id_idx";

-- DropIndex
DROP INDEX "patient_conditions_patient_id_key";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'WAITING';

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "relatedId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL,
DROP COLUMN "severity",
ADD COLUMN     "severity" "NotificationSeverity" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "patient_conditions" DROP COLUMN "approved_at",
DROP COLUMN "approved_by",
DROP COLUMN "calculated_at",
DROP COLUMN "created_at",
DROP COLUMN "is_nurse_approved",
DROP COLUMN "patient_id",
DROP COLUMN "updated_at",
ADD COLUMN     "approvedAt" TIMESTAMPTZ(3),
ADD COLUMN     "approvedBy" UUID,
ADD COLUMN     "calculatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isNurseApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "patientId" UUID NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMPTZ(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "settings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockoutUntil" TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_severity_idx" ON "notifications"("severity");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "patient_conditions_patientId_key" ON "patient_conditions"("patientId");

-- CreateIndex
CREATE INDEX "patient_conditions_patientId_idx" ON "patient_conditions"("patientId");

-- CreateIndex
CREATE INDEX "patient_conditions_isNurseApproved_idx" ON "patient_conditions"("isNurseApproved");

-- CreateIndex
CREATE INDEX "patient_conditions_approvedAt_idx" ON "patient_conditions"("approvedAt");

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_conditions" ADD CONSTRAINT "patient_conditions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
