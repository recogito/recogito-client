import type { Group, UserProfile } from 'src/Types';

export interface TeamMember {

  user: UserProfile;

  inGroup: Group;

  since: string;

}