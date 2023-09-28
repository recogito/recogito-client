import { Annotation, StoreChangeEvent, useAnnotationStore } from '@annotorious/react';
import { getProjectTagVocabulary } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useEffect, useState } from 'react';

export const useTagVocabulary = (projectId: string) => {

  const [vocabulary, setVocabulary] = useState<string[]>([]);

  const store = useAnnotationStore();

  useEffect(() => {
    getProjectTagVocabulary(supabase, projectId)
      .then(({ error, data }) => {
        if (error)
          console.error(error)
        else
          setVocabulary(data.map(t => t.name));
      });
  }, []);

  useEffect(() => {
    if (store) {
      const onChange = (event: StoreChangeEvent<Annotation>) => {
        // TODO observe store changes and update the tag set dynamically!
        console.log(event);
      }

      store.observe(onChange);

      return () => {
        store.unobserve(onChange);
      }
    }
  }, [store]);


  return vocabulary;

}