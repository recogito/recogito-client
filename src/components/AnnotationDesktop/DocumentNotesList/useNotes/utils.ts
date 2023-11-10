import type { PresentUser, User } from '@annotorious/react';
import type { DocumentNote } from '../DocumentNote';

export const toDate = (str?: string) => str ? new Date(str) : null;

export const getContributors = (note: DocumentNote): User[] => {
  const { created_by, updated_by } = note;

  const bodyCollaborators = note.bodies.reduce((users, body) =>  (
    [...users, body.creator, body.updatedBy]
  ), [] as User[]);

  return [
    created_by,
    updated_by,
    ...bodyCollaborators
  ].filter(u => u); // Remove undefined
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