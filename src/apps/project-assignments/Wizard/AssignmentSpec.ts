import type {
  DocumentInContext,
  ExtendedAssignmentData,
  UserProfile,
} from 'src/Types';

export interface AssignmentSpec {
  id?: string;

  name?: string;

  documents: DocumentInContext[];

  team: UserProfile[];

  description?: string;
}

// Utility crosswalk between ExtendedAssignmentData and AssignmentSpec
export const toAssignmentSpec = (
  data: ExtendedAssignmentData
): AssignmentSpec => ({
  id: data.id,
  name: data.name,
  description: data.description,
  documents: data.layers.map((layer) => ({
    id: layer.document.id,
    name: layer.document.name,
    created_at: layer.document.created_at,
    created_by: layer.document.created_by,
    updated_at: layer.document.updated_at,
    updated_by: layer.document.updated_by,
    bucket_id: layer.document.bucket_id,
    content_type: layer.document.content_type,
    meta_data: layer.document.meta_data,
    layers: [
      {
        id: layer.id,
        document_id: layer.document.id,
        project_id: data.project_id,
        name: layer.name,
        description: layer.description,
        context: {
          id: data.id,
          name: data.name,
          description: data.description,
          project_id: data.project_id,
        },
      },
    ],
  })),
  team:
    data.layers[0].groups
      .find((g) => g.is_default === true)
      ?.members.map((m) => m.user) || [],
});
