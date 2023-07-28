import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@backend/supabaseBrowserClient';
import { initDocument } from '@backend/helpers';
import type { DocumentInProject } from 'src/Types';
import type { Upload, UploadProgress, UploadStatus } from './Upload';

let queue = Promise.resolve();

export const useUpload = (
  onImport: (document: DocumentInProject) => void
) => {

  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const onProgress = (id: string, progress: number, status: UploadStatus) => {
    setUploads(prev => prev.map(upload => upload.id === id ? {
      ...upload,
      progress,
      status
    } : upload));
  };

  const onSuccess = (id: string, document: DocumentInProject) => {
    setUploads(prev => prev.map(upload => upload.id === id ? {
      ...upload,
      progress: 100,
      status: 'success'
    } : upload));

    onImport(document);
  };
    
  const onError = (id: string, message: string) => {
    setUploads(prev => prev.map(upload => upload.id === id ? {
      ...upload,
      progress: 100,
      status: 'failed',
      message
    } : upload));
  }

  const addUpload = (i: Upload) => {
    // A unique ID for tracking this import
    const id = uuidv4();

    setUploads(prev => [
      ...prev,
      { id, name: i.name, progress: 0, status: 'preparing' }
    ]);

    queue = queue.then(() => initDocument(
      supabase, 
      i.name, 
      i.projectId, 
      i.contextId, 
      progress => onProgress(id, progress, 'uploading'),
      i.file,
      i.url
    ).then(document => {
      onSuccess(id, document);
    })).catch(error => {
      onError(id, error);
    });

    return id;
  }

  const addUploads = (uploads: Upload[]) => uploads.forEach(addUpload);

  const isIdle = uploads.every(u => u.status === 'success' || u.status === 'failed');
  
  return {
    addUpload,
    addUploads,
    isIdle,
    uploads
  };

}