import { useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export const useNotes = (supabase: SupabaseClient) => {

  const [notes, setNotes] = useState<SupabaseAnnotation[]>([]);

  // A few Todos left here...

  return notes;

}