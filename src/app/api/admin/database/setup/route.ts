import { NextRequest, NextResponse } from "next/server";
import { DatabaseSetup } from "@/lib/database-setup";
import { getRequestRole } from "@/lib/rbac";

export async function POST(request: NextRequest) {
  try {
    // Check if user has admin permissions
    const role = getRequestRole(request);
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action = "init", includeSampleData = false } = body;

    let result;

    switch (action) {
      case "init":
        result = await DatabaseSetup.initializeDatabase();
        
        // If successful and sample data requested, seed it
        if (result.success && includeSampleData) {
          const seedResult = await DatabaseSetup.seedSampleData();
          result.data = {
            ...result.data,
            sampleData: seedResult.success ? seedResult.data : null,
          };
        }
        break;

      case "seed":
        result = await DatabaseSetup.seedSampleData();
        break;

      case "reset":
        result = await DatabaseSetup.resetDatabase();
        break;

      default:
        return NextResponse.json(
          { error: "Invalid action. Use 'init', 'seed', or 'reset'" },
          { status: 400 }
        );
    }

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user has admin permissions
    const role = getRequestRole(request);
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await DatabaseSetup.getDatabaseStatus();
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Database status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
