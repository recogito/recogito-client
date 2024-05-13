
import { useEffect, useState } from 'react';
import { getAvailableLayers } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { DocumentContext, DocumentWithContext } from 'src/Types';

export interface NamedLayer {

  layer_id: string;

  context_id?: string;

  context_name?: string;

  is_active: boolean;

}

export const useLayerNames = (document: DocumentWithContext) => {

  const [names, setNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const { layers, context} = document;

    const layerIds = new Set(layers.map(l => l.id));

    getAvailableLayers(supabase, context.project_id).then(({ data, error }) => {
      if (error) {
      } else {
        // The idea is that for each layer ID, we want the name of the context 
        // in which the given layer is the active one.
        const entries = data
          .filter(l => l.layer_id && l.is_active && l.context_name && layerIds.has(l.layer_id))
          .map(l => [l.layer_id, l.context_name] as [string, string]);
        
        setNames(new Map([...entries]))
      }
    });
  }, [document]);

  return names;

}