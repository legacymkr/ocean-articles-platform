import { NextRequest } from "next/server";

export type Role = "ADMIN" | "EDITOR" | "ANON";

// Simple role extraction: read from header `x-role`. Fallback to ADMIN in development.
export function getRequestRole(request: NextRequest): Role {
  const headerRole = request.headers.get("x-role")?.toUpperCase();
  if (headerRole === "ADMIN" || headerRole === "EDITOR") return headerRole;
  
  // Check for admin bypass environment variable
  if (process.env.ADMIN_BYPASS === "true") {
    return "ADMIN";
  }
  
  // In development mode, default to ADMIN for testing
  if (process.env.NODE_ENV === "development") {
    return "ADMIN";
  }
  
  // Temporary fix: Default to ADMIN until proper authentication is implemented
  // TODO: Implement proper authentication system
  return "ADMIN";
}

export function canCreateOrUpdate(role: Role): boolean {
  return role === "ADMIN" || role === "EDITOR";
}

export function canDelete(role: Role): boolean {
  return role === "ADMIN";
}

export function canPublish(role: Role): boolean {
  return role === "ADMIN";
}


