import { useEffect, useState } from 'react';
import { getLayerPolicies, getOrganizationPolicies, getProjectPolicies } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Policies } from 'src/Types';
import type { Response } from '@backend/Types';

const _usePolicies = (rpc: () => Response<Policies>) => {

  const [policies, setPolicies] = useState<Policies | undefined>(undefined);

  useEffect(() => {
    rpc().then(({ error, data }) => {
      if (!error)
        setPolicies(data);
    });
  }, []);

  return policies;

}

export const useProjectPolicies = (projectId: string) =>
  _usePolicies(() => getProjectPolicies(supabase, projectId));

export const useOrganizationPolicies = () =>
  _usePolicies(() => getOrganizationPolicies(supabase));

export const useLayerPolicies = (layerId: string) =>
  _usePolicies(() => getLayerPolicies(supabase, layerId));