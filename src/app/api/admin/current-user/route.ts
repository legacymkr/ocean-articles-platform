import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    if (!db) {
      // Return a fallback admin user when database is not available
      return NextResponse.json({
        user: {
          id: "admin-fallback",
          name: "Admin User",
          email: "admin@galatide.com",
          role: "ADMIN",
        }
      });
    }

    // Get the first admin user (since we don't have proper auth yet)
    let adminUser = await db.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });

    // If no admin user exists, create one
    if (!adminUser) {
      try {
        adminUser = await db.user.create({
          data: {
            name: "Admin User",
            email: "admin@galatide.com",
            role: "ADMIN",
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        });
      } catch (error) {
        console.error("Error creating admin user:", error);
        // Return fallback if creation fails
        return NextResponse.json({
          user: {
            id: "admin-fallback",
            name: "Admin User",
            email: "admin@galatide.com",
            role: "ADMIN",
          }
        });
      }
    }

    return NextResponse.json({ user: adminUser });
  } catch (error) {
    console.error("Error fetching current user:", error);
    
    // Return fallback admin user on error
    return NextResponse.json({
      user: {
        id: "admin-fallback",
        name: "Admin User",
        email: "admin@galatide.com",
        role: "ADMIN",
      }
    });
  }
}