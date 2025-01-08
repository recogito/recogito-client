export interface UserProfile {
  id: string;

  nickname?: string;

  first_name?: string;

  last_name?: string;

  avatar_url?: string;
}

/** Used in the Admin section */
export interface ExtendedUserProfile extends UserProfile {
  email_address: string;

  last_sign_in_at: string;

  org_group_id: string;

  org_group_name: string;
}

export type MyProfile = UserProfile & {
  created_at: string;

  email: string;

  isOrgAdmin: boolean;
};

export type Member = {
  inGroup: Group | undefined;

  since: string;

  user: UserProfile;
};

export interface Project {
  id: string;

  created_at: string;

  created_by: UserProfile;

  updated_at: string;

  updated_by: string;

  name: string;

  description?: string;

  is_open_join?: boolean;

  is_open_edit?: boolean;

  is_locked?: boolean;
}

export enum DocumentViewRight {
  closed = 'closed',
  annotations = 'annotations',
  notes = 'notes',
}

export interface ExtendedProjectData {
  id: string;

  created_at: string;

  created_by: UserProfile;

  updated_at: string;

  updated_by: string;

  name: string;

  description?: string;

  is_open_join?: boolean;

  is_open_edit?: boolean;

  is_locked?: boolean;

  contexts: Context[];

  groups: Group[];

  documents: Document[];

  users: Member[];

  document_view_right: DocumentViewRight;
}

export interface ProjectDocument {
  id?: string;

  created_at?: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  project_id: string;

  document_id: string;
}

export interface Group {
  id: string;

  name: string;

  is_admin: boolean;

  is_default: boolean;

  members: {
    user: UserProfile;

    since: string;
  }[];
}

export interface Document {
  id: string;

  created_at?: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  name: string;

  bucket_id?: string;

  content_type?: ContentType;

  is_private?: boolean;

  collection_id?: string;

  meta_data?: {
    protocol: Protocol;

    url: string;

    meta?: DocumentMetadata[];
  };

  collection_metadata?: {
    revision_number: number;

    document_id: string;
  };
}

export interface DocumentMetadata {
  label: string;
  value: string;
}

export interface DocumentWithContext extends Document {
  context: DocumentContext;

  layers: DocumentLayer[];
}

export interface DocumentContext {
  id: string | undefined;

  name: string | undefined;

  description: string | undefined;

  project_id: string;

  is_project_default?: boolean;

  project_is_locked?: boolean;

  layer_contexts?: any;
}

export interface DocumentLayer {
  id: string;

  is_active?: boolean;

  document_id: string;

  project_id: string;

  name?: string;

  context?: DocumentContext;
}

export interface EmbeddedLayer {
  id: string;

  name?: string;

  is_active?: boolean;
}

export type Layer = DocumentLayer | EmbeddedLayer;

export interface LayerWithDocument extends DocumentLayer {
  document: Document;
}

export const ContentTypes = [
  'application/pdf',
  'text/plain',
  'text/xml',
] as const;

export type ContentType = (typeof ContentTypes)[number] | string;

export const Protocols = ['IIIF_IMAGE', 'IIIF_PRESENTATION'] as const;

export type Protocol = (typeof Protocols)[number];

export interface Context {
  id: string;

  name: string;

  description?: string;

  project_id: string;

  is_project_default?: boolean;

  created_at: string;

  assign_all_members: boolean;

  sort: number;

<<<<<<< HEAD
  sort: number;

=======
>>>>>>> 411758fc (Lwj/add all members to assignment (#346))
  members: {
    id: string;

    user_id: string;

    user: {
      nickname: string;

      first_name: string;

      last_name: string;

      avatar_url: string;
    };
  }[];

  context_documents: {
    document: {
      id: string;

      name: string;

      content_type: string;

      meta_data: any;

      is_private: boolean;
    };
  }[];
}

export interface TaggedContext extends Context {
  tags: Tag[];
}

export interface ExtendedAssignmentData extends Context {
  team: {
    user: UserProfile;

    since: string;
  }[];

  layers: {
    id: string;

    name: string;

    description: string;

    document: Document;

    is_active_layer: boolean;
  }[];
}

export interface Collection {
  created_at?: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  id: string;

  name: string;

  extension_id?: string;

  extension_metadata?: object;

  custom_css?: string;
}

export interface TagDefinition {
  id: string;

  name: string;

  target_type?:
    | 'context'
    | 'document'
    | 'group'
    | 'layer'
    | 'profile'
    | 'project';

  scope: 'organization' | 'project' | 'system';

  scope_id?: string;

  tags?: Tag[];
}

export interface Tag {
  id: string;

  created_at: string;

  created_by?: string;

  target_id: string;

  tag_definition?: TagDefinition;

  tag_definition_id: string;
}

export interface VocabularyTerm {
  label: string;

  color?: string;
}

export interface InstalledPlugin {
  id: string;

  created_at: string;

  created_by?: string;

  updated_at?: string;

  updated_by?: string;

  project_id: string;

  plugin_name: string;

  plugin_id: string;

  plugin_settings?: any;
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

export interface JoinRequest {
  id: string;

  created_at: string;

  user_id: string;

  project_id: string;

  accepted?: boolean;

  ignored?: boolean;

  user: UserProfile;
}

export type TableName =
  | 'bodies'
  | 'documents'
  | 'contexts'
  | 'layers'
  | 'projects'
  | 'project_documents'
  | 'targets';

export type OperationType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';

export type Policies = {
  get(t: TableName): { has: (operation: OperationType) => boolean };
};

export type LoginMethod = {
  name: string;

  type: 'username_password' | 'saml' | 'oauth' | 'magic_link' | 'keycloak';

  domain: string;
};

export type GroupMember = {
  user: {
    id: string;
    nickname: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  in_group: string;
  since: string;
};

export type ApiPostInviteUserToProject = {
  users: { email: string; projectGroupId: string }[];
  projectId: string;
  projectName: string;
  invitedBy: string;
};

export type ApiAcceptOrgInvite = {
  email: string;
  password: string;
  token: string;
};

export type IIIFMetadata = {
  label: {
    [key: string]: string[];
  };
  value: {
    [key: string]: string[];
  };
};
