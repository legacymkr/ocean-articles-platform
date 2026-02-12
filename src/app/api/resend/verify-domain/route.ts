import { NextRequest, NextResponse } from 'next/server';
import { ResendDomainService } from '@/lib/services/resend-domain-service';

/**
 * POST /api/resend/verify-domain - Verify galatide.com domain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const domainId = body.domainId;
    
    if (!domainId) {
      // Try to find galatide.com domain automatically
      console.log('🔍 No domain ID provided, searching for galatide.com...');
      
      const domainsResult = await ResendDomainService.listDomains();
      if (domainsResult.success && domainsResult.domains) {
        const galatideDomain = domainsResult.domains.find(d => d.name === 'galatide.com');
        if (galatideDomain) {
          console.log('✅ Found galatide.com domain:', galatideDomain.id);
          
          const result = await ResendDomainService.verifyDomain(galatideDomain.id);
          
          if (result.success) {
            return NextResponse.json({
              success: true,
              domain: result.domain,
              message: 'Galatide.com domain verification completed successfully',
              canSendEmails: result.domain?.status === 'verified'
            });
          } else {
            return NextResponse.json({
              success: false,
              error: result.error,
              message: 'Domain verification failed'
            }, { status: 400 });
          }
        } else {
          return NextResponse.json({
            success: false,
            error: 'Galatide.com domain not found',
            message: 'Please setup the domain first using POST /api/resend/setup-domain'
          }, { status: 404 });
        }
      } else {
        return NextResponse.json({
          success: false,
          error: 'Failed to list domains',
          message: 'Could not search for galatide.com domain'
        }, { status: 400 });
      }
    }
    
    console.log('✅ Verifying domain with ID:', domainId);
    
    const result = await ResendDomainService.verifyDomain(domainId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        domain: result.domain,
        message: 'Domain verification completed successfully',
        canSendEmails: result.domain?.status === 'verified'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Domain verification failed'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error verifying domain:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to verify domain'
    }, { status: 500 });
  }
}
