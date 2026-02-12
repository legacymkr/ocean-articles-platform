import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface ResendContact {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed: boolean;
  createdAt: string;
}

export interface CreateContactData {
  email: string;
  firstName?: string;
  lastName?: string;
  unsubscribed?: boolean;
}

/**
 * Resend Audience Management Service
 * Handles creating audiences and managing contacts using Resend API
 */
export class ResendAudienceService {
  
  /**
   * Get or create the main newsletter audience
   */
  static async getOrCreateNewsletterAudience(): Promise<string | null> {
    if (!resend) {
      console.warn('Resend not configured');
      return null;
    }

    try {
      // Try to get existing audience ID from environment
      const existingAudienceId = process.env.RESEND_NEWSLETTER_AUDIENCE_ID;
      if (existingAudienceId) {
        // Verify it exists
        try {
          await resend.audiences.get(existingAudienceId);
          return existingAudienceId;
        } catch (error) {
          console.warn('Configured audience ID not found, creating new one');
        }
      }

      // Create new audience
      const { data, error } = await resend.audiences.create({
        name: 'Galatide Ocean Newsletter Subscribers',
      });

      if (error) {
        console.error('Failed to create Resend audience:', error);
        return null;
      }

      console.log('✅ Created new Resend audience:', data?.id);
      console.log('🔧 Add this to your environment variables:');
      console.log(`RESEND_NEWSLETTER_AUDIENCE_ID="${data?.id}"`);
      
      return data?.id || null;
    } catch (error) {
      console.error('Error managing Resend audience:', error);
      return null;
    }
  }

  /**
   * Add a contact to the newsletter audience
   */
  static async addContactToNewsletter(contactData: CreateContactData): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const audienceId = await this.getOrCreateNewsletterAudience();
      if (!audienceId) {
        return { success: false, error: 'Failed to get audience ID' };
      }

      // Check if contact already exists
      const existingContact = await this.getContactByEmail(contactData.email, audienceId);
      if (existingContact) {
        if (!existingContact.unsubscribed) {
          return { success: false, error: 'Email already subscribed' };
        }
        
        // Reactivate existing contact by removing and re-adding
        // (Resend API doesn't support updating unsubscribed status reliably)
        try {
          await resend.contacts.remove({
            email: contactData.email,
            audienceId,
          });
        } catch (removeError) {
          console.warn('Failed to remove existing contact, will try to create anyway:', removeError);
        }
        
        // Continue to create new contact below
      }

      // Create new contact
      const { data, error } = await resend.contacts.create({
        email: contactData.email,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        unsubscribed: contactData.unsubscribed || false,
        audienceId,
      });

      if (error) {
        console.error('Failed to create Resend contact:', error);
        return { success: false, error: 'Failed to create contact' };
      }

      return { success: true, contactId: data?.id };
    } catch (error) {
      console.error('Error adding contact to newsletter:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get contact by email
   */
  static async getContactByEmail(email: string, audienceId?: string): Promise<ResendContact | null> {
    if (!resend) {
      return null;
    }

    try {
      const targetAudienceId = audienceId || await this.getOrCreateNewsletterAudience();
      if (!targetAudienceId) {
        return null;
      }

      const { data, error } = await resend.contacts.get({
        email,
        audienceId: targetAudienceId,
      });

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        unsubscribed: data.unsubscribed,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.warn('Contact not found or error retrieving:', error);
      return null;
    }
  }

  /**
   * Update contact
   */
  static async updateContact(
    contactId: string, 
    audienceId: string, 
    updates: { firstName?: string; lastName?: string; unsubscribed?: boolean }
  ): Promise<{ success: boolean; contactId?: string; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      // Get the contact's email first to update by email (Resend API requirement)
      const contact = await this.getContactByEmail('', audienceId);
      
      // Resend API requires updating by email + audienceId, not by ID
      const { data, error } = await resend.contacts.update({
        audienceId,
        id: contactId, // Contact ID (UUID)
        firstName: updates.firstName,
        lastName: updates.lastName,
        unsubscribed: updates.unsubscribed,
      });

      if (error) {
        console.error('Failed to update Resend contact:', error);
        return { success: false, error: 'Failed to update contact' };
      }

      return { success: true, contactId: data?.id };
    } catch (error) {
      console.error('Error updating contact:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Get all active newsletter subscribers
   */
  static async getActiveSubscribers(): Promise<string[]> {
    if (!resend) {
      console.warn('Resend not configured');
      return [];
    }

    try {
      const audienceId = await this.getOrCreateNewsletterAudience();
      if (!audienceId) {
        return [];
      }

      const { data, error } = await resend.contacts.list({
        audienceId,
      });

      if (error || !data) {
        console.error('Failed to get contacts:', error);
        return [];
      }

      // Filter active subscribers
      const activeEmails = data.data
        .filter(contact => !contact.unsubscribed)
        .map(contact => contact.email);

      return activeEmails;
    } catch (error) {
      console.error('Error getting active subscribers:', error);
      return [];
    }
  }

  /**
   * Unsubscribe contact by email
   */
  static async unsubscribeByEmail(email: string): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const audienceId = await this.getOrCreateNewsletterAudience();
      if (!audienceId) {
        return { success: false, error: 'Failed to get audience ID' };
      }

      // Simply remove the contact from the audience (Resend's recommended approach)
      const { error } = await resend.contacts.remove({
        email,
        audienceId,
      });

      if (error) {
        console.error('Failed to unsubscribe contact:', error);
        return { success: false, error: 'Failed to unsubscribe' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing contact:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
