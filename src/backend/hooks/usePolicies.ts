import { useEffect, useState } from 'react';
import { getProjectPolicies } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Policies } from 'src/Types';

export const usePolicies = (projectId: string) => {

  const [policies, setPolicies] = useState<Policies | undefined>(undefined);

  useEffect(() => {
    getProjectPolicies(supabase, projectId)
      .then(({ error, data }) => {
        if (!error)
          setPolicies(data);
      });
  }, []);

  return policies;

}