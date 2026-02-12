import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

type DraftCommentRow = Tables<'draft_comments'>;

export interface DraftComment {
  id: string;
  draft_id: string;
  user_id: string;
  comment: string;
  comment_type: 'general' | 'suggestion' | 'question' | 'internal';
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  user_name?: string;
  user_role?: string;
}

export function useDraftComments(draftId: string) {
  const [comments, setComments] = useState<DraftComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const loadComments = async () => {
    if (!user || !draftId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_comments')
        .select('*')
        .eq('draft_id', draftId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentsWithUserData = (data || []).map(comment => ({
        ...comment,
        comment_type: (comment.comment_type as DraftComment['comment_type']) || 'general',
        is_internal: comment.is_internal || false,
        user_name: 'User', // Simplified for now
        user_role: 'user'
      }));

      setComments(commentsWithUserData);
    } catch (error) {
      console.error('Failed to load comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (
    comment: string,
    commentType: DraftComment['comment_type'] = 'general',
    isInternal: boolean = false
  ): Promise<boolean> => {
    if (!user || !draftId) return false;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('draft_comments')
        .insert({
          draft_id: draftId,
          user_id: user.id,
          comment,
          comment_type: commentType,
          is_internal: isInternal,
        });

      if (error) throw error;

      toast.success('Comment added successfully');
      await loadComments();
      return true;
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateComment = async (
    commentId: string,
    newComment: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('draft_comments')
        .update({
          comment: newComment,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comment updated successfully');
      await loadComments();
      return true;
    } catch (error) {
      console.error('Failed to update comment:', error);
      toast.error('Failed to update comment');
      return false;
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('draft_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comment deleted successfully');
      await loadComments();
      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
      return false;
    }
  };

  // Set up real-time subscription for comments
  useEffect(() => {
    if (!draftId) return;

    const channel = supabase
      .channel(`draft-comments-${draftId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_comments',
          filter: `draft_id=eq.${draftId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [draftId]);

  useEffect(() => {
    if (user && draftId) {
      loadComments();
    }
  }, [user, draftId]);

  return {
    comments,
    isLoading,
    isSaving,
    addComment,
    updateComment,
    deleteComment,
    loadComments,
  };
}