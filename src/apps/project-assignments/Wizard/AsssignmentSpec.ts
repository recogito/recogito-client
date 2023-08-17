import type { DocumentInProject, UserProfile } from 'src/Types';

export interface AssignmentSpec {

  name: string;

  documents: DocumentInProject[];

  team: UserProfile[];

  description?: string;

}