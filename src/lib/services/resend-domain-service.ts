import { Resend } from 'resend';

// Use the new API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface ResendDomain {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  region: string;
  dnsProvider?: string;
  records?: DnsRecord[];
}

export interface DnsRecord {
  record: string;
  name: string;
  value: string;
  type: string;
  ttl?: string;
  priority?: number;
}

export interface CreateDomainData {
  name: string;
  region?: 'us-east-1' | 'eu-west-1' | 'ap-southeast-1';
}

export interface UpdateDomainData {
  id: string;
  openTracking?: boolean;
  clickTracking?: boolean;
}

/**
 * Resend Domain Management Service
 * Handles domain operations for email sending
 */
export class ResendDomainService {
  
  /**
   * Add a new domain to Resend
   */
  static async addDomain(domainData: CreateDomainData): Promise<{ success: boolean; domain?: ResendDomain; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log(`🌐 Adding domain: ${domainData.name}`);
      
      const result = await resend.domains.create({
        name: domainData.name,
        region: (domainData.region as any) || 'us-east-1'
      });

      if (result.error) {
        console.error('❌ Failed to add domain:', result.error);
        return { success: false, error: result.error.message || 'Failed to add domain' };
      }

      console.log('✅ Domain added successfully:', result.data);
      return { success: true, domain: result.data as any };
      
    } catch (error) {
      console.error('❌ Error adding domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error adding domain' 
      };
    }
  }

  /**
   * Retrieve domain information
   */
  static async getDomain(domainId: string): Promise<{ success: boolean; domain?: ResendDomain; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log(`🔍 Retrieving domain: ${domainId}`);
      
      const result = await resend.domains.get(domainId);

      if (result.error) {
        console.error('❌ Failed to retrieve domain:', result.error);
        return { success: false, error: result.error.message || 'Failed to retrieve domain' };
      }

      console.log('✅ Domain retrieved successfully:', result.data);
      return { success: true, domain: result.data as any };
      
    } catch (error) {
      console.error('❌ Error retrieving domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error retrieving domain' 
      };
    }
  }

  /**
   * Verify domain DNS records
   */
  static async verifyDomain(domainId: string): Promise<{ success: boolean; domain?: ResendDomain; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log(`✅ Verifying domain: ${domainId}`);
      
      const result = await resend.domains.verify(domainId);

      if (result.error) {
        console.error('❌ Failed to verify domain:', result.error);
        return { success: false, error: result.error.message || 'Failed to verify domain' };
      }

      console.log('✅ Domain verification completed:', result.data);
      return { success: true, domain: result.data as any };
      
    } catch (error) {
      console.error('❌ Error verifying domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error verifying domain' 
      };
    }
  }

  /**
   * Update domain settings
   */
  static async updateDomain(updateData: UpdateDomainData): Promise<{ success: boolean; domain?: ResendDomain; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log(`🔧 Updating domain: ${updateData.id}`);
      
      const result = await resend.domains.update({
        id: updateData.id,
        openTracking: updateData.openTracking,
        clickTracking: updateData.clickTracking,
      });

      if (result.error) {
        console.error('❌ Failed to update domain:', result.error);
        return { success: false, error: result.error.message || 'Failed to update domain' };
      }

      console.log('✅ Domain updated successfully:', result.data);
      return { success: true, domain: result.data as any };
      
    } catch (error) {
      console.error('❌ Error updating domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error updating domain' 
      };
    }
  }

  /**
   * List all domains
   */
  static async listDomains(): Promise<{ success: boolean; domains?: ResendDomain[]; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log('📋 Listing all domains');
      
      const result = await resend.domains.list();

      if (result.error) {
        console.error('❌ Failed to list domains:', result.error);
        return { success: false, error: result.error.message || 'Failed to list domains' };
      }

      console.log('✅ Domains listed successfully:', result.data);
      return { success: true, domains: (result.data?.data as any) || [] };
      
    } catch (error) {
      console.error('❌ Error listing domains:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error listing domains' 
      };
    }
  }

  /**
   * Delete a domain
   */
  static async deleteDomain(domainId: string): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      console.log(`🗑️ Deleting domain: ${domainId}`);
      
      const result = await resend.domains.remove(domainId);

      if (result.error) {
        console.error('❌ Failed to delete domain:', result.error);
        return { success: false, error: result.error.message || 'Failed to delete domain' };
      }

      console.log('✅ Domain deleted successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error deleting domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error deleting domain' 
      };
    }
  }

  /**
   * Add galatide.com domain automatically
   */
  static async setupGalatideDomain(): Promise<{ success: boolean; domain?: ResendDomain; error?: string }> {
    try {
      console.log('🌊 Setting up galatide.com domain for Ocean newsletter...');
      
      // First, check if domain already exists
      const existingDomains = await this.listDomains();
      if (existingDomains.success && existingDomains.domains) {
        const galatideDomain = existingDomains.domains.find(d => d.name === 'galatide.com');
        if (galatideDomain) {
          console.log('✅ galatide.com domain already exists:', galatideDomain.id);
          return { success: true, domain: galatideDomain };
        }
      }

      // Add the domain
      const result = await this.addDomain({
        name: 'galatide.com',
        region: 'us-east-1'
      });

      if (result.success && result.domain) {
        console.log('🎉 galatide.com domain added successfully!');
        console.log('📋 Next steps:');
        console.log('1. Add the DNS records to your domain provider');
        console.log('2. Wait for DNS propagation (up to 24 hours)');
        console.log('3. Verify the domain using the verify endpoint');
        
        return result;
      }

      return result;
      
    } catch (error) {
      console.error('❌ Error setting up galatide.com domain:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error setting up domain' 
      };
    }
  }
}
