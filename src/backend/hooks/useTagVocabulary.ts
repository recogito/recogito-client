import { useEffect, useState } from 'react';
import { useAnnotationStore } from '@annotorious/react';
import type { Annotation, StoreChangeEvent } from '@annotorious/react';
import { getProjectTagVocabulary } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { VocabularyTerm } from 'src/Types';

export const useTagVocabulary = (projectId: string) => {

  const [vocabulary, setVocabulary] = useState<VocabularyTerm[]>([]);

  const store = useAnnotationStore();

  useEffect(() => {
    getProjectTagVocabulary(supabase, projectId)
      .then(({ error, data }) => {
        if (error)
          console.error(error)
        else
          setVocabulary(data);
      });
  }, []);

  const getUniqueTags = (annotations: Annotation[]): string[] => {
    const tagBodies = annotations.reduce((tags, annotation) => {
      const t = annotation.bodies.filter(b => b.purpose === 'tagging');
      return [...tags, ...t.map(b => b.value!)];
    }, [] as string[]);

    return Array.from(new Set(tagBodies));
  }

  const addToVocabulary = (tags: string[]) => 
    setVocabulary(current => {
      const toAdd = tags.filter(term => !current.some(t => t.label === term));
      return [...current, ...toAdd.map(label => ({ label }))];
    });

  useEffect(() => {
    if (store) {
      const onChange = (event: StoreChangeEvent<Annotation>) => {
        const { created, updated } = event.changes;

        let tags: string[] = [];

        if (created)
          tags = getUniqueTags(created);

        if (updated)
          tags = [...tags, ...getUniqueTags(updated.map(u => u.newValue))];

        addToVocabulary(tags);
      }

      store.observe(onChange);

      return () => {
        store.unobserve(onChange);
      }
    }
  }, [store]);


  return vocabulary;

}