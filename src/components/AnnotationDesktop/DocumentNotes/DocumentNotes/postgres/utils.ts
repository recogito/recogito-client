import type { PresentUser, User } from '@annotorious/react';
import type { DocumentNote, DocumentNoteBody } from '../../Types';

export const toDate = (str?: string | Date) => str ? new Date(str) : undefined;

export const getContributors = (note: DocumentNote): User[] => {
  const { created_by, updated_by } = note;

  const bodyCollaborators = note.bodies.reduce((users, body) =>  (
    [...users, body.creator as User, body.updatedBy as User].filter(Boolean)
  ), [] as User[]);

  return [
    created_by,
    updated_by,
    ...bodyCollaborators
  ].filter(Boolean) as User[]; // Remove undefined
}

export const findUser = (id: string | undefined, presentUsers: PresentUser[], note?: DocumentNote) => {
  if (!id)
    return;

  // Check if this user is already in this annotation
  if (note) {
    const collaborator = getContributors(note).find(u => u.id === id);
    if (collaborator)
      return collaborator;
  }

  // Last resort: check if this user is present
  return presentUsers.find(user => user.id === id);
}

export const parseBodyRecord = (record: any, present: PresentUser[], note?: DocumentNote): DocumentNoteBody => ({
  id: record.id,
  annotation: record.annotation_id,
  created: toDate(record.created_at)!,
  creator: findUser(record.created_by, present, note)!,
  updated: toDate(record.updated_at),
  updatedBy: findUser(record.updated_by, present, note),
  purpose: record.purpose,
  value: record.value,
  layer_id: record.layer_id
} as DocumentNoteBody);
