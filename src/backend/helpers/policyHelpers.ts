import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { OperationType, Policies, TableName } from 'src/Types';

interface OrganizationPolicy {

  user_id: string; 

  table_name: string;

  operation: string;
  
}

interface ProjectPolicy extends OrganizationPolicy {
  
  project_id: string;

}

interface LayerPolicy extends OrganizationPolicy {

  layer_id: string;

}

/**
 * A helper utility that provides a nicer interface to check policies, 
 * along the following lines:
 * 
 * policies.get('projects').has('INSERT');
 * 
 */
const parsePolicies = <T extends OrganizationPolicy>(policies: T[]): Policies => {
  // Index policies by table
  const byTable = new Map<string, T[]>();

  policies.forEach(p => {
    const existing = byTable.get(p.table_name);
    if (existing) {
      byTable.set(p.table_name, [...existing, p]);
    } else {
      byTable.set(p.table_name, [p]);
    }
  });

  const get = (t: TableName) => {
    const tablePolicies = byTable.get(t);

    return tablePolicies ? ({
      has: (operation: OperationType) =>
        tablePolicies.some(p => p.operation === operation)
    }) : ({
      has: () => false
    });
  }

  return { get };
}

export const getOrganizationPolicies = (
  supabase: SupabaseClient
): Response<Policies> =>
  supabase
    .rpc('get_organization_policies')
    .then(({ error, data }) => ({ error, data: parsePolicies(data) }));

// TODO
// get_project_policies(_project_id)
// get_layer_policies(_layer_id)

