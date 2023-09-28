import { getProjectTagVocabulary } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useEffect, useState } from 'react';

export const useTagVocabulary = (projectId: string) => {

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  useEffect(() => {
    getProjectTagVocabulary(supabase, projectId)
      .then(({ error, data }) => {
        if (error)
          console.error(error)
        else
          setVocabulary(data.map(t => t.name));
      });
  }, []);

  return vocabulary;

}