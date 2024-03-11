
import type { userRole } from "@backend/Types";
import type { SupabaseClient } from "@supabase/supabase-js"

export const isOpenJoinEditFromContext = (supabase: SupabaseClient, contextId: string) =>
  supabase
    .rpc('is_open_edit_join_from_context_rpc', { _context_id: contextId })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error joining project', error);
        return null;
      } else {
        return data as string;
      }
    });

export const addDocumentsToContext = (supabase: SupabaseClient,
  documentIds: string[],
  contextId: string) =>
  supabase
    .rpc('add_documents_to_context_rpc', { _context_id: contextId, _document_ids: documentIds })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error adding document to context', error);
        return false;
      } else {
        return data as boolean;
      }
    })

export const addUsersToContext = (supabase: SupabaseClient, contextId: string, users: userRole[]) =>
  supabase
    .rpc('add_users_to_context_rpc', { _context_id: contextId, _users: users })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error adding users to context', error);
        return false;
      } else {
        return data as boolean;
      }
    })

export const removeUsersFromContext = (supabase: SupabaseClient, contextId: string, users: string[]) =>
  supabase
    .rpc('remove_users_from_context_rpc', { _context_id: contextId, _user_ids: users })
    .then(({ data, error }) => {
      if (error) {
        console.error('Error removing users from context', error);
        return false;
      } else {
        return data as boolean;
      }
    })


