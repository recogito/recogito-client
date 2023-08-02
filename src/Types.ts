export interface UserProfile {

  id: string;

  nickname?: string;

  first_name?: string;

  last_name?: string;

  avatar_url?: string;

}

export type MyProfile = UserProfile & {

  created_at: string;

  email: string;

  role: 'admin' | 'base_user' | 'teacher'

}

export interface Project {

  id: string;

  created_at: string;

  created_by: UserProfile;

  updated_at: string;

  updated_by: string;

  name: string;

  description?: string;

}

/** 
 * Project with additional context data, as used
 * in the project cards.
 */
export interface ExtendedProjectData {

  id: string;

  created_at: string;

  created_by: UserProfile;

  updated_at: string;

  updated_by: string;

  name: string;

  description?: string;

  contexts: Context[];

  layers: [{

    id: string;
  
    name: string;

    description: string;

    document: {

      id: string;

      name: string;

      content_type?: ContentType;

      meta_data: {

        protocol: Protocol;

        url: string;
    
        meta?: object;

      }
    }

  }];

  groups: ProjectGroup[];

}

export interface ProjectGroup {

  id: string;

  name: string;

  members: Array<{ 

    user: UserProfile; 

    since: string;

  }>;

}

export interface ProjectMember {

  user: UserProfile;

  in_group: string;

  since: string;

}

export interface Document {

  id: string; 

  created_at: string;

  created_by: string;

  updated_at?: string;

  updated_by?: string;

  name: string;

  bucket_id?: string;

  content_type?: ContentType;

  meta_data?: { 

    protocol: Protocol;

    url: string;

    meta?: object;

  };

}

export interface DocumentInProject extends Document {

  layers: Layer[];

}

export const ContentTypes = ['text/plain', 'application/tei+xml'] as const;

export type ContentType = typeof ContentTypes[number];

export const Protocols = ['IIIF_IMAGE'] as const;

export type Protocol = typeof Protocols[number];

export interface Context {

  id: string;

  name: string;

  project_id: string;

}

export interface Layer {

  id: string;
  
  document_id: string;

  project_id: string;

  name?: string;

  description?: string;

}

export interface TagDefinition {

  id: string;

  created_at: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  name: string;

  target_type: 'context' | 'document' | 'group' | 'layer' | 'profile' | 'project';

  scope: 'organization' | 'project' | 'system';

  scope_id?: string;
 
}

export interface Tag {

  id: string;

  created_at: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  tag_definition_id: string;

  target_id: string;

}

export interface Translations { 
 
  lang: string;

  t: { [key: string]: string };

}

export interface Invitation {

  id: string;

  created_at: string;

  email: string;

  invited_by_name?: string;

  project_name?: string;

  project_id: string;

  accepted?: boolean;

  ignored?: boolean;

}

export type TableName = 'projects' | 'documents'; 

export type OperationType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export type Policies = {

  get(t: TableName): { has: (operation: OperationType) => boolean }

}