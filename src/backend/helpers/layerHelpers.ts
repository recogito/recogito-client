import type { SupabaseClient } from "@supabase/supabase-js";
import type { Layer } from "src/Types";

export const createLayerInContext = (
  supabase: SupabaseClient, 
  document_id: string, 
  project_id: string,
  context_id: string,
  name?: string,
  description?: string
): Promise<Layer> => 
  new Promise((resolve, reject) => {
    supabase
      .from('layers')
      .insert({
        document_id,
        project_id,
        name,
        description
      })
      .select()
      .single()
      .then(({ error, data }) => {
        const layer = data as Layer;

        if (error || !data) {
          reject(error);
        } else {
          supabase
            .from('layer_contexts')
            .insert({
              layer_id: layer.id,
              context_id
            })
            .select()
            .single()
            .then(({ error, data }) => {
              if (error || !data) {
                reject(error);
              } else {
                resolve(layer);
              }
            });
        }
      });
  });
