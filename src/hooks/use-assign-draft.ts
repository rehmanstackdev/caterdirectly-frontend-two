
import { supabase } from '@/integrations/supabase/client';

export interface AssignDraftParams {
  clientEmail: string;
  selectedServices: any[];
  selectedItems: Record<string, any>;
  formData: Record<string, any>;
  name?: string;
  expiresAtDays?: number;
}

/**
 * Hook to assign the current booking (admin setup) as a draft to a client by email.
 * - Requires the client to already exist (email in profiles).
 * - Uses RLS policies that allow admins to insert drafts for any user.
 */
export function useAssignDraft() {
  const assignToClientByEmail = async ({
    clientEmail,
    selectedServices,
    selectedItems,
    formData,
    name,
    expiresAtDays = 30,
  }: AssignDraftParams): Promise<{ draftId: string; clientUserId: string }> => {
    // 1) Find client profile by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .ilike('email', clientEmail)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Failed to look up client: ${profileError.message}`);
    }

    if (!profile?.id) {
      throw new Error('No client found with that email. Please ensure the client has an account.');
    }

    // 2) Insert draft for that user (RLS lets admins insert for any user)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (expiresAtDays || 30));

    const { data: draft, error: insertError } = await supabase
      .from('draft_orders')
      .insert({
        user_id: profile.id,
        name: name || formData?.orderName || 'Proposal Draft',
        selected_services: selectedServices ?? [],
        selected_items: selectedItems ?? {},
        form_data: formData ?? {},
        expires_at: expiresAt.toISOString(),
      })
      .select('id, user_id')
      .single();

    if (insertError) {
      throw new Error(`Failed to create draft for client: ${insertError.message}`);
    }

    return { draftId: draft.id, clientUserId: draft.user_id };
  };

  return { assignToClientByEmail };
}
