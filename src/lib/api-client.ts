/**
 * API client utilities for making authenticated requests
 */

// Helper function to add admin headers in development
export function getApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // In development mode, automatically add admin role header
  if (process.env.NODE_ENV === "development") {
    headers["x-role"] = "ADMIN";
  }

  return headers;
}

// Helper function to make authenticated API requests
export async function apiRequest(url: string, options: RequestInit = {}) {
  const headers = {
    ...getApiHeaders(),
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}
