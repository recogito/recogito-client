import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient.js';
import type { Document } from 'src/Types';

export const useContent = (document: Document) => {
  const [text, setText] = useState<string | undefined>();

  useEffect(() => {
    supabase.storage
      .from(document.bucket_id!)
      .download(document.id)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else data.text().then(setText);
      });
  }, []);

  return text;
};
