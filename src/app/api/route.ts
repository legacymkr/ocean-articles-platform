import { NextResponse } from 'next/server';

// This file ensures API routes are not pre-built during static generation
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ 
    message: 'Galatide Ocean API', 
    status: 'operational',
    timestamp: new Date().toISOString()
  });
}
