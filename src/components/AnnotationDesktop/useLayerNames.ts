import { useEffect, useState } from 'react';
import { getAvailableLayers } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { DocumentWithContext, EmbeddedLayer } from 'src/Types';

export const useLayerNames = (document: DocumentWithContext, embeddedLayers?: EmbeddedLayer[]) => {

  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const { context} = document;

    getAvailableLayers(supabase, context.project_id).then(({ data, error }) => {
      if (error) {
        console.error(error);
      } else {
        // The idea is that for each layer ID, we want the name of the context 
        // in which the given layer is the active one.
        const entries = data
          .filter(l => l.layer_id && l.is_active && l.context_name)
          .map(l => [l.layer_id, l.context_name] as [string, string]);
        
        setNames(names => new Map([...names.entries(), ...entries]))
      }
    });
  }, [document]);

  useEffect(() => {
    if (embeddedLayers) {
      const entries = embeddedLayers
        .filter(l => l.name)
        .map(l => [l.id, l.name] as [string, string]);

      setNames(names => new Map([...names.entries(), ...entries]))
    }
  }, [embeddedLayers]);

  return names;

}