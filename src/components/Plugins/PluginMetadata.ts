export interface PluginMetadata {

  directory: string;

  id: string;

  name: string;

  version: string;

  description?: string;

  author?: string;

  homepage?: string;

  extension_points: {

    [extension_point: string]: string

  };

  options: {

    [key: string]: any

  }

}