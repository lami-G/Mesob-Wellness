-- Fix schema mismatches between Prisma schema and database

-- 1. Add missing 'conditions' column to wellness_plans table
ALTER TABLE "wellness_plans" ADD COLUMN IF NOT EXISTS "conditions" JSONB;

-- 2. Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "relatedId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- 3. Create indexes for notifications if they don't exist
CREATE INDEX IF NOT EXISTS "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX IF NOT EXISTS "notifications_isRead_idx" ON "notifications"("isRead");
CREATE INDEX IF NOT EXISTS "notifications_type_idx" ON "notifications"("type");
CREATE INDEX IF NOT EXISTS "notifications_severity_idx" ON "notifications"("severity");
CREATE INDEX IF NOT EXISTS "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");
CREATE INDEX IF NOT EXISTS "notifications_createdAt_idx" ON "notifications"("createdAt" DESC);

-- 4. Add foreign key constraint for notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'notifications_userId_fkey'
    ) THEN
        ALTER TABLE "notifications" 
        ADD CONSTRAINT "notifications_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 5. Create NotificationType enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationType') THEN
        CREATE TYPE "NotificationType" AS ENUM (
            'APPOINTMENT_REMINDER',
            'APPOINTMENT_CONFIRMED',
            'APPOINTMENT_CANCELLED',
            'SYSTEM_ALERT',
            'WELLNESS_TIP',
            'FEEDBACK_REQUEST',
            'USER_REGISTRATION',
            'DATA_ISSUE'
        );
    END IF;
END $$;

-- 6. Create NotificationSeverity enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NotificationSeverity') THEN
        CREATE TYPE "NotificationSeverity" AS ENUM (
            'LOW',
            'MEDIUM',
            'HIGH',
            'CRITICAL'
        );
    END IF;
END $$;

-- 7. Update notifications table to use enums (if table exists and columns are TEXT)
DO $$
BEGIN
    -- Check if type column is TEXT and convert to enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'type' 
        AND data_type = 'text'
    ) THEN
        ALTER TABLE "notifications" 
        ALTER COLUMN "type" TYPE "NotificationType" 
        USING "type"::text::"NotificationType";
    END IF;

    -- Check if severity column is TEXT and convert to enum
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'severity' 
        AND data_type = 'text'
    ) THEN
        -- Drop the default first
        ALTER TABLE "notifications" ALTER COLUMN "severity" DROP DEFAULT;
        
        -- Convert the column type
        ALTER TABLE "notifications" 
        ALTER COLUMN "severity" TYPE "NotificationSeverity" 
        USING "severity"::text::"NotificationSeverity";
        
        -- Re-add the default
        ALTER TABLE "notifications" ALTER COLUMN "severity" SET DEFAULT 'MEDIUM'::"NotificationSeverity";
    END IF;
END $$;
