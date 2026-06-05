# Quick Fix Reference - Database Schema Issues

**Quick Reference for Resolving Database Schema Mismatches**

---

## 🚨 Common Error Patterns

### Error: "Column does not exist"
```
The column `table_name.column_name` does not exist in the current database.
```

**Quick Fix**:
```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:generate
npm run build
```

### Error: "Table does not exist"
```
The table `public.table_name` does not exist in the current database.
```

**Quick Fix**:
```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:generate
npm run build
```

### Error: "Migration failed to apply"
```
Error: P3018
A migration failed to apply.
Migration name: <migration_name>
```

**Quick Fix**:
```bash
cd backend
npx prisma migrate resolve --rolled-back <migration_name>
npm run prisma:migrate:deploy
npm run prisma:generate
```

---

## ✅ Standard Resolution Workflow

### Step 1: Check Migration Status
```bash
cd backend
npx prisma migrate status
```

### Step 2: Resolve Failed Migrations (if any)
```bash
# For each failed migration:
npx prisma migrate resolve --rolled-back <migration_name>
```

### Step 3: Deploy All Migrations
```bash
npm run prisma:migrate:deploy
```

### Step 4: Regenerate Prisma Client
```bash
npm run prisma:generate
```

### Step 5: Rebuild Application
```bash
npm run build
```

### Step 6: Restart Server
```bash
npm start
# or for development:
npm run dev
```

---

## 🔍 Diagnostic Commands

### Check Database Connection
```bash
npx prisma db pull
```

### View Current Schema
```bash
npm run prisma:studio
```

### Validate Prisma Schema
```bash
npx prisma validate
```

### Check Migration History
```bash
npx prisma migrate status
```

---

## 🛠️ Emergency Fixes

### Reset Database (Development Only!)
```bash
# ⚠️ WARNING: This will delete all data!
npm run prisma:reset
```

### Create New Migration
```bash
npx prisma migrate dev --name fix_schema_issue
```

### Apply Specific Migration
```bash
npx prisma migrate deploy
```

---

## 📋 Checklist After Schema Changes

- [ ] Run `npm run prisma:migrate:deploy`
- [ ] Run `npm run prisma:generate`
- [ ] Run `npm run build`
- [ ] Restart the server
- [ ] Test affected API endpoints
- [ ] Check server logs for errors
- [ ] Verify data integrity

---

## 🔗 Useful Links

- **Prisma Migrate Docs**: https://pris.ly/d/migrate
- **Prisma Resolve Docs**: https://pris.ly/d/migrate-resolve
- **Prisma Client Docs**: https://pris.ly/d/client

---

## 📞 When to Escalate

Contact the development team if:
- Migrations fail after 3 resolution attempts
- Data loss is suspected
- Production database is affected
- Error messages are unclear or undocumented

---

**Last Updated**: May 28, 2026  
**Version**: 1.0.1
