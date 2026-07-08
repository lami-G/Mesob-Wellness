import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

// Load .env manually before importing Prisma
const __dirname = dirname(fileURLToPath(import.meta.url));
const envContent = readFileSync(resolve(__dirname, ".env"), "utf8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const idx = trimmed.indexOf("=");
  if (idx === -1) continue;
  process.env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
}

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");
const pg = require("pg");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function hash(pw) {
  return bcrypt.hash(pw, 10);
}

async function nextDisplayId() {
  const result = await pool.query(
    "SELECT nextval('user_display_id_seq') AS nextval",
  );

  return String(result.rows[0].nextval).padStart(4, '0');
}

async function main() {
  console.log("🌱 Seeding test users...");
  console.log("   Connecting to:", process.env.DATABASE_URL);

  const users = [
    {
      email: "admin@mesob.et",
      fullName: "System Admin",
      role: "SYSTEM_ADMIN",
      password: "Admin123!",
    },
    {
      email: "federal@mesob.et",
      fullName: "Federal Officer",
      role: "FEDERAL_OFFICE",
      password: "Federal123!",
    },
    {
      email: "regional@mesob.et",
      fullName: "Regional Officer",
      role: "REGIONAL_OFFICE",
      password: "Regional123!",
    },
    {
      email: "manager@mesob.et",
      fullName: "Center Manager",
      role: "MANAGER",
      password: "Manager123!",
    },
    {
      email: "nurse@mesob.et",
      fullName: "Nurse Officer",
      role: "NURSE_OFFICER",
      password: "Nurse123!",
    },
    {
      email: "staff@mesob.et",
      fullName: "Staff Member",
      role: "STAFF",
      password: "Staff123!",
    },
  ];

  for (const u of users) {
    const hashedPassword = await hash(u.password);
    const userId = await nextDisplayId();
    await pool.query(
      `
      INSERT INTO users (id, email, password, "fullName", role, "userId", "isActive", "isVerified", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4::\"UserRole\", $5, true, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        "fullName" = EXCLUDED."fullName",
        role = EXCLUDED.role,
        "userId" = EXCLUDED."userId",
        "isActive" = true,
        "isVerified" = true,
        "updatedAt" = NOW()
    `,
      [u.email, hashedPassword, u.fullName, u.role, userId],
    );
    console.log(`  ✅ ${u.role.padEnd(16)} → ${u.email} (${userId})`);
  }

  console.log("\n✅ Done! Test users updated with role passwords.");
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
