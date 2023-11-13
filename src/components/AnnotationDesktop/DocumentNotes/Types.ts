import type { User } from '@annotorious/react';

export interface DocumentNote {

  id: string;

  created_at: Date;

  created_by: ProfileRecord;

  updated_at?: Date;

  updated_by?: ProfileRecord;

  is_private?: boolean;
  
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

export interface BroadcastMessage {

  from: User;

  events: BroadcastEvent[];

}

export type BroadcastEvent = 
  MakePublicEvent | DeleteNoteEvent | DeleteNoteBodyEvent;

export enum BroadcastEventType {

  DELETE_NOTE = 'DELNOTE',

  MAKE_PUBLIC = 'PUBNOTE',

  DELETE_NOTE_BODY = 'DELNOTEBDY'

}

export type DeleteNoteEvent = {

  type: BroadcastEventType.DELETE_NOTE;

  id: string;

} 

export type MakePublicEvent = {

  type: BroadcastEventType.MAKE_PUBLIC;

  note: DocumentNote;

}

export type DeleteNoteBodyEvent = {

  type: BroadcastEventType.DELETE_NOTE_BODY;

  id: string;

  annotation: string;

}