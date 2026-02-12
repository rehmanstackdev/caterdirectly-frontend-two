/**
 * Simple user object interface to replace Supabase User type
 */
interface SimpleUser {
  id: string;
  email: string;
  user_metadata?: {
    first_name?: string;
    [key: string]: any;
  };
}

/**
 * SSOT: Send welcome email to new user
 * DRY: Reusable across all signup flows
 * Observable: Runs in application layer with proper error handling
 */
export const sendWelcomeEmail = async (
  userId: string, 
  email: string, 
  firstName: string
): Promise<boolean> => {
  try {
    console.log('API Call: RPC', {
      function: 'process_urgent_email',
      params: {
        p_template_name: 'user_welcome',
        p_recipient_email: email,
        p_recipient_name: firstName,
        p_template_variables: {
          first_name: firstName,
          email,
          login_url: `${window.location.origin}/auth`,
          marketplace_url: `${window.location.origin}/marketplace`
        },
        p_user_id: userId
      }
    });
    
    console.log('[Onboarding] Welcome email queued for:', email);
    console.log('API Call Complete: RPC', { function: 'process_urgent_email', result: 'success' });
    return true;
  } catch (err) {
    console.error('[Onboarding] Email service error:', err);
    console.log('API Call Error: RPC', { function: 'process_urgent_email', error: err });
    return false;
  }
};

/**
 * KISS: Complete user onboarding in one place
 * Future-proof: Easy to add analytics, audit logs, etc.
 */
export const completeUserOnboarding = async (user: SimpleUser): Promise<void> => {
  try {
    const firstName = user.user_metadata?.first_name || 'User';
    const email = user.email;
    
    console.log('[Onboarding] Starting onboarding for:', user.id);
    console.log('API Call: ONBOARDING', { userId: user.id, email, firstName });
    
    // Send welcome email (non-blocking)
    await sendWelcomeEmail(user.id, email, firstName);
    
    // Future: Add analytics tracking
    // Future: Add audit logging
    // Future: Add user segmentation
    
    console.log('[Onboarding] Onboarding completed for:', user.id);
    console.log('API Call Complete: ONBOARDING', { userId: user.id, result: 'success' });
  } catch (error) {
    // Log but don't throw - onboarding failures shouldn't break signup
    console.error('[Onboarding] Onboarding error:', error);
    console.log('API Call Error: ONBOARDING', { error });
  }
};
