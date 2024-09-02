import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@backend/supabaseBrowserClient';
import { initDocument } from '@backend/helpers';
import type { Document } from 'src/Types';
import type { Upload, UploadProgress, UploadStatus } from './Upload';

let queue = Promise.resolve();

export const useUpload = (onImport: (documents: Document[]) => void) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dataDirty, setDataDirty] = useState(false);

  // Using useRef here because it is synchronous so we ensure that
  // onImport is called with all successful documents
  const completedDocs = useRef<Document[]>([]);

  useEffect(() => {
    if (uploads.length > 0) {
      let completeCount = 0;
      uploads.forEach((u) => {
        if (u.status === 'success' || u.status === 'failed') {
          completeCount++;
        }
      });

      if (completeCount === uploads.length) {
        onImport(completedDocs.current);
      }
    }
  }, [uploads]);

  const onProgress = (id: string, progress: number, status: UploadStatus) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress,
              status,
            }
          : upload
      )
    );
  };

  const onSuccess = (id: string, document: Document) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress: 100,
              status: 'success',
            }
          : upload
      )
    );

    completedDocs.current = [...completedDocs.current, document];
  };

  const onError = (id: string, message: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress: 100,
              status: 'failed',
              message,
            }
          : upload
      )
    );
  };

  const addUpload = (i: Upload) => {
    // A unique ID for tracking this import
    const id = uuidv4();

    setUploads((prev) => [
      ...prev,
      { id, name: i.name, progress: 0, status: 'preparing' },
    ]);

    queue = queue
      .then(() =>
        initDocument(
          supabase,
          i.name,
          i.projectId,
          (progress) => onProgress(id, progress, 'uploading'),
          i.file,
          i.url,
          i.protocol
        ).then((document) => {
          setDataDirty(true);
          onSuccess(id, document);
        })
      )
      .catch((error) => {
        onError(id, error);
      });

    return id;
  };

  const addUploads = (uploads: Upload[]) => uploads.forEach(addUpload);

  const isIdle = uploads.every(
    (u) => u.status === 'success' || u.status === 'failed'
  );

  const clearDirtyFlag = () => setDataDirty(false);

  return {
    addUpload,
    addUploads,
    isIdle,
    uploads,
    dataDirty,
    clearDirtyFlag,
  };
};
