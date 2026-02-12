import { NextResponse } from 'next/server';
import { ResendDomainService } from '@/lib/services/resend-domain-service';

/**
 * POST /api/resend/setup-domain - Setup galatide.com domain
 */
export async function POST() {
  try {
    console.log('🌊 Setting up galatide.com domain for Ocean newsletter...');
    
    const result = await ResendDomainService.setupGalatideDomain();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        domain: result.domain,
        message: 'Galatide.com domain setup completed successfully',
        instructions: {
          step1: 'Add the DNS records provided by Resend to your domain provider',
          step2: 'Wait for DNS propagation (up to 24 hours)',
          step3: 'Verify the domain using POST /api/resend/verify-domain',
          step4: 'Start sending emails from ocean@galatide.com'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to setup galatide.com domain'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error setting up domain:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to setup domain'
    }, { status: 500 });
  }
}

/**
 * GET /api/resend/setup-domain - Check domain setup status
 */
export async function GET() {
  try {
    console.log('🔍 Checking galatide.com domain status...');
    
    const domainsResult = await ResendDomainService.listDomains();
    
    if (domainsResult.success && domainsResult.domains) {
      const galatideDomain = domainsResult.domains.find(d => d.name === 'galatide.com');
      
      if (galatideDomain) {
        return NextResponse.json({
          success: true,
          domain: galatideDomain,
          status: galatideDomain.status,
          message: `Galatide.com domain found with status: ${galatideDomain.status}`,
          canSendEmails: galatideDomain.status === 'verified'
        });
      } else {
        return NextResponse.json({
          success: false,
          message: 'Galatide.com domain not found',
          canSendEmails: false,
          suggestion: 'Run POST /api/resend/setup-domain to add the domain'
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        error: domainsResult.error,
        message: 'Failed to check domain status'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error checking domain status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
