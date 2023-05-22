export interface Project {

  id: string;

  created_at: string;

  created_by: string;

  updated_at: string;

  updated_by: string;

  name: string;

  description: string;

}

export type Translations = { [key: string]: string };