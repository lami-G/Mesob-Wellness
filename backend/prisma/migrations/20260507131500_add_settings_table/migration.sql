-- CreateTable "settings"
CREATE TABLE IF NOT EXISTS "settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "settings_key_key" ON "settings"("key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "settings_key_idx" ON "settings"("key");

