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

  const getUniqueTags = (annotations: Annotation[]): string[] => {
    const tagBodies = annotations.reduce((tags, annotation) => {
      const t = annotation.bodies.filter(b => b.purpose === 'tagging');
      return [...tags, ...t.map(b => b.value)];
    }, [] as string[]);

    return Array.from(new Set(tagBodies));
  }

  const addToVocabulary = (tags: string[]) =>
    setVocabulary(vocabulary => Array.from(new Set([...vocabulary, ...tags])));

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