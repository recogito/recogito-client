import { useEffect, useState } from 'react';
import { getOrganizationPolicies, getProjectPolicies } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Policies } from 'src/Types';

export const useProjectPolicies = (projectId: string) => {

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

export const useOrganizationPolicies = () => {

  const [policies, setPolicies] = useState<Policies | undefined>(undefined);

  useEffect(() => {
    getOrganizationPolicies(supabase)
      .then(({ error, data }) => {
        if (!error)
          setPolicies(data);
      });
  }, []);

  return policies;

}