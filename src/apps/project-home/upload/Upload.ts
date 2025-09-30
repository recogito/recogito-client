import type { CollectionMetadata, Protocol } from 'src/Types';

export interface Upload {

  name: string;

  projectId?: string;

  contextId?: string;

  file?: File;

  url?: string;

  protocol?: Protocol;

  isPrivate: boolean;

  collectionId?: string;

  collectionMetadata?: CollectionMetadata;

}

export interface UploadProgress {

  id: string;

  name: string;

  progress: number;

  status: UploadStatus;

  message?: string;

}

export type UploadStatus = 'preparing' | 'uploading' | 'success' | 'failed';