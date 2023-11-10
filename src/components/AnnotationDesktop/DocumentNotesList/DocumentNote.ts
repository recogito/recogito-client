import type { User } from '@annotorious/react';

export interface DocumentNote {

  id: string;

  created_at: Date;

  created_by: ProfileRecord;

  updated_at?: Date;

  updated_by?: ProfileRecord;

  is_private: boolean;
  
  layer_id: string;

  bodies: DocumentNoteBody[];

}

export interface DocumentNoteBody {

  id: string;

  annotation: string;

  created: Date;

  creator: User;

  updated?: Date;

  updatedBy?: User;

  format?: string;

  purpose?: string;
  
  value: string;

  layer_id: string;

}

export interface ProfileRecord {

  id: string;

  nickname?: string;

  first_name?: string;

  last_name?: string;

  avatar_url?: string;

}