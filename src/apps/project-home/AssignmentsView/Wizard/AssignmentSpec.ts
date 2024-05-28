import type {
  DocumentWithContext,
  ExtendedAssignmentData,
  UserProfile,
} from 'src/Types';

export interface AssignmentSpec {
  id?: string;

  created_at?: string;

  name?: string;

  project_id: string;

  documents: DocumentWithContext[];

  team: UserProfile[];

  description?: string;
}

// Utility crosswalk between ExtendedAssignmentData and AssignmentSpec
export const contextToAssignmentSpec = (
  data: ExtendedAssignmentData
): AssignmentSpec => {
  const documents: any[] = [];

  data.layers.forEach((layer) => {
    let found = documents.find((d) => d.id === layer.document.id);
    if (!found) {
      found = {
        id: layer.document.id,
        name: layer.document.name,
        is_private: layer.document.is_private,
        created_at: layer.document.created_at,
        created_by: layer.document.created_by,
        updated_at: layer.document.updated_at,
        updated_by: layer.document.updated_by,
        bucket_id: layer.document.bucket_id,
        content_type: layer.document.content_type,
        meta_data: layer.document.meta_data,
        layers: [],
      };

      documents.push(found);
    }

    found.layers.push({
      id: layer.id,
      document_id: layer.document.id,
      project_id: data.project_id,
      name: layer.name,
      description: layer.description,
      is_active: layer.is_active_layer,
      context: {
        id: data.id,
        name: data.name,
        description: data.description as string,
        project_id: data.project_id,
        is_project_default: false,
      },
    });
  });

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    project_id: data.project_id,
    created_at: data.created_at,
    documents: documents,
    team: data.team.map((t) => t.user),
  };
};

export const assignmentSpecToContext = (spec: AssignmentSpec) => {
  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    project_id: spec.project_id,
    created_at: new Date().toISOString(),
    is_project_default: !spec.name,
    members: spec.team.map((t) => {
      return {
        id: '',
        user_id: t.id,
        user: t,
      };
    }),
    context_users: spec.team.map((t) => {
      return {
        user_id: t.id,
        user: {
          nickname: t.nickname,
          first_name: t.first_name,
          last_name: t.last_name,
          avatar_url: t.avatar_url,
        },
      };
    }),
    context_documents: spec.documents.map((d) => {
      return {
        document: {
          id: d.id,
          name: d.name,
          content_type: d.content_type,
          meta_data: d.meta_data,
        },
      };
    }),
  };
};
