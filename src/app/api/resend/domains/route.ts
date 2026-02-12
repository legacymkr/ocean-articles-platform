import { NextRequest, NextResponse } from 'next/server';
import { ResendDomainService } from '@/lib/services/resend-domain-service';

/**
 * GET /api/resend/domains - List all domains
 */
export async function GET() {
  try {
    console.log('📋 API: Listing Resend domains...');
    
    const result = await ResendDomainService.listDomains();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        domains: result.domains,
        count: result.domains?.length || 0
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error in domains API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/resend/domains - Add a new domain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🌐 API: Adding new domain:', body);
    
    if (!body.name) {
      return NextResponse.json({
        success: false,
        error: 'Domain name is required'
      }, { status: 400 });
    }
    
    const result = await ResendDomainService.addDomain({
      name: body.name,
      region: body.region || 'us-east-1'
    });
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        domain: result.domain,
        message: `Domain ${body.name} added successfully`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error adding domain:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
