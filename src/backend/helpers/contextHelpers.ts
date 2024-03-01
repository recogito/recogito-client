
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


