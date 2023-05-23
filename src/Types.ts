import type { ReactNode } from 'react';

export interface UserProfile {

  id: string;

  nickname?: string;

  avatar_url?: string;

}

export interface Project {

  id: string;

  created_at: string;

  created_by: string;

  updated_at: string;

  updated_by: string;

  name: string;

  description: string;

}

export type Translations = { 
 
  lang: string;

  t: { [key: string]: string };

}

export interface UIAlert {

  icon?: ReactNode;

  title: string;

  description?: string;

  severity: 'info' | 'warning' | 'error';

} 