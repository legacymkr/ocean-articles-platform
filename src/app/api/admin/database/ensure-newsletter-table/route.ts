import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Check if newsletter_subscribers table exists and create if not
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true NOT NULL,
        subscribed_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Create index for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS newsletter_subscribers_email_idx ON newsletter_subscribers(email);
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS newsletter_subscribers_active_idx ON newsletter_subscribers(is_active);
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Newsletter subscribers table ensured' 
    });

  } catch (error) {
    console.error('Error ensuring newsletter table:', error);
    return NextResponse.json(
      { error: 'Failed to ensure newsletter table', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
