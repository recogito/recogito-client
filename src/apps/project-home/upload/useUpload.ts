import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@backend/supabaseBrowserClient';
import { initDocument } from '@backend/helpers';
import type { Document } from 'src/Types';
import type { Upload, UploadProgress, UploadStatus } from './Upload';

const BUCKET_NAME = 'documents';

// Supabase's default file size limit is 50MB
const DEFAULT_FILE_SIZE_LIMIT = 50 * 1024 * 1024;

let queue = Promise.resolve();

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Upload failed';
};

export const useUpload = (onImport: (documents: Document[]) => void) => {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [dataDirty, setDataDirty] = useState(false);
  const [fileSizeLimit, setFileSizeLimit] = useState<number | undefined>();

  // Using useRef here because it is synchronous so we ensure that
  // onImport is called with all successful documents
  const completedDocs = useRef<Document[]>([]);

  useEffect(() => {
    supabase.storage.getBucket(BUCKET_NAME).then(({ data, error }) => {
      if (error) {
        console.error('Failed to fetch documents bucket', error);
      } else {
        setFileSizeLimit(data.file_size_limit ?? DEFAULT_FILE_SIZE_LIMIT);
      }
    });
  }, []);

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
    if (progress < 100) {
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
    }
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
          i.isPrivate,
          i.projectId || null,
          i.collectionId || null,
          i.collectionMetadata || null,
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
        console.error('Upload failed', error);
        onError(id, getErrorMessage(error));
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
    fileSizeLimit,
    isIdle,
    uploads,
    dataDirty,
    clearDirtyFlag,
  };
};
