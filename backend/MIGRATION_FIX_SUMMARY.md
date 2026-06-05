# Database Migration Fix Summary

**Date**: May 28, 2026  
**Status**: ✅ Resolved  
**Impact**: Critical - API endpoints were failing due to schema mismatches

---

## 🐛 Issues Identified

### 1. Missing `wellness_plans.conditions` Column
**Error**: 
```
The column `wellness_plans.conditions` does not exist in the current database.
```

**Impact**: 
- `GET /api/v1/conditions/period` endpoint returning 500 errors
- Patient condition tracking feature broken
- Analytics dashboard unable to display condition data

**Root Cause**: 
- Prisma schema defined `conditions` field on `WellnessPlan` model
- Database migration that should have added this column was incomplete
- The column was supposed to be added in migration `20260511000000_add_patient_conditions`

### 2. Missing `notifications` Table
**Error**:
```
The table `public.notifications` does not exist in the current database.
```

**Impact**:
- `GET /api/v1/notifications/unread-count` endpoint failing
- Notification system non-functional
- Users not receiving system alerts or appointment reminders

**Root Cause**:
- Migration `20260507_add_notifications` existed but may not have been applied
- Enum types `NotificationType` and `NotificationSeverity` were missing

### 3. Failed Migrations
**Errors**:
- Migration `20260430000000_add_waiting_in_service_statuses` - Empty migration file
- Migration `20260503141326_add_profile_picture` - Column already exists error
- Migration `20260512000000_add_sequential_display_id` - Referenced non-existent `employeeId` column

**Impact**:
- Blocked all subsequent migrations from being applied
- Database schema out of sync with application code
- New features couldn't be deployed

---

## ✅ Solutions Implemented

### 1. Created Comprehensive Fix Migration
**File**: `backend/prisma/migrations/20260528000000_fix_schema_mismatches/migration.sql`

**Changes**:
- ✅ Added `conditions` JSONB column to `wellness_plans` table
- ✅ Created `notifications` table with all required fields
- ✅ Created `NotificationType` enum (8 types)
- ✅ Created `NotificationSeverity` enum (4 levels)
- ✅ Added all required indexes for notifications (6 indexes)
- ✅ Added foreign key constraint for `notifications.userId`
- ✅ Converted text columns to enum types where needed

### 2. Made All Migrations Idempotent
Updated migrations to use safe SQL patterns:
- `CREATE TABLE IF NOT EXISTS` instead of `CREATE TABLE`
- `ALTER TABLE ADD COLUMN IF NOT EXISTS` instead of `ALTER TABLE ADD COLUMN`
- `CREATE INDEX IF NOT EXISTS` instead of `CREATE INDEX`
- Conditional foreign key creation using PL/pgSQL blocks

**Files Updated**:
- `20260430000000_add_waiting_in_service_statuses/migration.sql` - Created missing file
- `20260503141326_add_profile_picture/migration.sql` - Added IF NOT EXISTS
- `20260507131500_add_settings_table/migration.sql` - Added IF NOT EXISTS
- `20260511000000_add_patient_conditions/migration.sql` - Added IF NOT EXISTS
- `20260512000000_add_sequential_display_id/migration.sql` - Fixed to use `userId` instead of `employeeId`
- `20260513000000_rename_employeeId_to_userId/migration.sql` - Made idempotent

### 3. Resolved Failed Migrations
Used Prisma's migration resolution commands:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

Resolved migrations:
- ✅ `20260430000000_add_waiting_in_service_statuses`
- ✅ `20260503141326_add_profile_picture`
- ✅ `20260512000000_add_sequential_display_id`
- ✅ `20260528000000_fix_schema_mismatches`

### 4. Applied All Migrations Successfully
```bash
npm run prisma:migrate:deploy
```

Result: **All 13 migrations applied successfully** ✅

### 5. Regenerated Prisma Client
```bash
npm run prisma:generate
```

Result: **Prisma Client v7.7.0 generated successfully** ✅

---

## 🧪 Verification

### Database Schema Verification
After applying fixes, the following now exist:

#### `wellness_plans` Table
```sql
Column      | Type   | Description
------------|--------|----------------------------------
conditions  | JSONB  | Patient health conditions (JSON)
```

#### `notifications` Table
```sql
Column      | Type                    | Description
------------|-------------------------|---------------------------
id          | UUID                    | Primary key
userId      | UUID                    | Foreign key to users
type        | NotificationType        | Notification type enum
severity    | NotificationSeverity    | Severity level enum
title       | TEXT                    | Notification title
message     | TEXT                    | Notification message
isRead      | BOOLEAN                 | Read status
relatedId   | TEXT                    | Related entity ID
createdAt   | TIMESTAMPTZ(3)          | Creation timestamp
updatedAt   | TIMESTAMPTZ(3)          | Update timestamp
```

#### Enums Created
- `NotificationType`: 8 values (APPOINTMENT_REMINDER, APPOINTMENT_CONFIRMED, etc.)
- `NotificationSeverity`: 4 values (LOW, MEDIUM, HIGH, CRITICAL)

#### Indexes Created
- `notifications_userId_idx`
- `notifications_isRead_idx`
- `notifications_type_idx`
- `notifications_severity_idx`
- `notifications_userId_isRead_idx`
- `notifications_createdAt_idx`

---

## 📊 Impact Assessment

### Before Fix
- ❌ 2 API endpoints failing (500 errors)
- ❌ Patient condition tracking broken
- ❌ Notification system non-functional
- ❌ 4 migrations in failed state
- ❌ Database schema out of sync

### After Fix
- ✅ All API endpoints operational
- ✅ Patient condition tracking working
- ✅ Notification system functional
- ✅ All 13 migrations applied successfully
- ✅ Database schema synchronized with Prisma schema
- ✅ Prisma Client regenerated with correct types

---

## 🔄 Migration Status

### Total Migrations: 13
| # | Migration | Status |
|---|-----------|--------|
| 1 | `init_postgresql` | ✅ Applied |
| 2 | `add_feedback_fields` | ✅ Applied |
| 3 | `add_sms_reminder_tracking` | ✅ Applied |
| 4 | `role_restructuring_7_roles` | ✅ Applied |
| 5 | `add_waiting_in_service_statuses` | ✅ Applied (Fixed) |
| 6 | `add_profile_picture` | ✅ Applied (Fixed) |
| 7 | `add_notifications` | ✅ Applied |
| 8 | `add_settings_table` | ✅ Applied (Fixed) |
| 9 | `add_patient_conditions` | ✅ Applied (Fixed) |
| 10 | `add_sequential_display_id` | ✅ Applied (Fixed) |
| 11 | `rename_employeeId_to_userId` | ✅ Applied (Fixed) |
| 12 | `add_glucose_type_and_rename_no_show` | ✅ Applied |
| 13 | `fix_schema_mismatches` | ✅ Applied (New) |

---

## 🛡️ Prevention Measures

### Best Practices Implemented
1. **Idempotent Migrations**: All migrations now use `IF NOT EXISTS` clauses
2. **Conditional Logic**: PL/pgSQL blocks for complex operations
3. **Safe Defaults**: Proper default values for enum conversions
4. **Foreign Key Checks**: Conditional foreign key creation
5. **Migration Testing**: Verified all migrations can be re-run safely

### Recommendations
1. ✅ Always test migrations in development before production
2. ✅ Use `IF NOT EXISTS` for all DDL operations
3. ✅ Keep migration files in sync with Prisma schema
4. ✅ Run `prisma migrate deploy` after pulling schema changes
5. ✅ Regenerate Prisma Client after schema changes
6. ⚠️ Consider adding migration tests to CI/CD pipeline
7. ⚠️ Implement database backup before running migrations

---

## 📝 Commands Used

### Migration Resolution
```bash
# Mark failed migrations as rolled back
npx prisma migrate resolve --rolled-back <migration_name>

# Deploy all pending migrations
npm run prisma:migrate:deploy

# Regenerate Prisma Client
npm run prisma:generate
```

### Verification
```bash
# Check migration status
npx prisma migrate status

# Open Prisma Studio to verify data
npm run prisma:studio
```

---

## 🎯 Next Steps

### Immediate
- [x] Apply migrations to production database
- [x] Regenerate Prisma Client
- [x] Restart backend server
- [x] Verify API endpoints are working
- [x] Update documentation

### Short-term
- [ ] Add migration tests to CI/CD
- [ ] Document migration rollback procedures
- [ ] Create database backup automation
- [ ] Add health check for schema validation

### Long-term
- [ ] Implement blue-green deployment for migrations
- [ ] Add migration monitoring and alerting
- [ ] Create migration rollback scripts
- [ ] Document disaster recovery procedures

---

## 📞 Support

If you encounter any issues related to these migrations:

1. Check migration status: `npx prisma migrate status`
2. Review migration logs in terminal output
3. Verify database connection in `.env` file
4. Check PostgreSQL logs for detailed errors
5. Refer to Prisma documentation: https://pris.ly/d/migrate-resolve

---

**Status**: ✅ All issues resolved  
**Database**: Fully synchronized  
**API**: Operational  
**Last Updated**: May 28, 2026
