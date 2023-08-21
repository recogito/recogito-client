import type { DocumentInContext, UserProfile } from 'src/Types';

export interface AssignmentSpec {

  name?: string;

  documents: DocumentInContext[];

  team: UserProfile[];

  description?: string;

}