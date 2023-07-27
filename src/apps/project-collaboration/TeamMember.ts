import type { ProjectGroup, UserProfile } from 'src/Types';

export interface TeamMember {

  user: UserProfile;

  inGroup: ProjectGroup;

  since: string;

}