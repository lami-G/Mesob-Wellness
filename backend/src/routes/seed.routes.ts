import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/prisma";
import { env } from "../config/env";

const router = Router();

/**
 * ONE-TIME SEED ENDPOINT
 * Use this once to create initial admin users
 * IMPORTANT: Remove this route after seeding or protect it with a secret key
 */
router.post("/initialize-admin", async (req, res) => {
  try {
    // Security check - require a secret key
    const { secretKey } = req.body;
    
    if (!env.SEED_SECRET_KEY || secretKey !== env.SEED_SECRET_KEY) {
      return res.status(403).json({
        status: "error",
        message: "Invalid secret key",
      });
    }

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

    const results = [];
    
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Get next userId from sequence
      const result = await prisma.$queryRaw<Array<{ nextval: bigint }>>`
        SELECT nextval('user_display_id_seq') AS nextval
      `;
      const userId = String(result[0].nextval).padStart(4, '0');

      // Upsert user
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          fullName: userData.fullName,
          role: userData.role as any,
          isActive: true,
          isVerified: true,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          role: userData.role as any,
          userId: userId,
          isActive: true,
          isVerified: true,
          canLogin: true,
        },
      });

      results.push({
        email: user.email,
        role: user.role,
        userId: user.userId,
      });
    }

    res.json({
      status: "success",
      message: "Admin users created successfully",
      data: results,
    });
  } catch (error: any) {
    console.error("Seed error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to seed database",
      error: error.message,
    });
  }
});

export default router;
