import * as tus from 'tus-js-client';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = `https://${import.meta.env.PUBLIC_SUPABASE}`;

export const uploadFileResumable = (
  supabase: SupabaseClient, 
  file: File, 
  filename: string,
  onProgress?: (bytesTotal: number, bytesUploaded: number, percent: number) => void
): Promise<void> => new Promise((resolve, reject) => {
  return supabase.auth.getSession().then(({ error, data }) => {
    if (error) {
      reject(error)
    } else {
      const token = data.session?.access_token;
      if (!token) {
        reject('No session token');
      } else {
        const upload = new tus.Upload(file, {
          endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            authorization: `Bearer ${token}`,
            'x-upsert': 'true'
          },
          uploadDataDuringCreation: true,
          metadata: {
            bucketName: 'documents',
            objectName: filename,
            contentType: file.type
          },
          // NOTE: it must be set to 6MB (for now) do not change it
          // See https://supabase.com/docs/guides/storage/uploads#resumable-upload
          chunkSize: 6 * 1024 * 1024, 
          onError: function (error) {
            reject(error)
          },
          onProgress: function (bytesUploaded, bytesTotal) {
            if (onProgress) {
              const percent = (bytesUploaded / bytesTotal) * 100;
              console.log('asdfasddfasdf', percent);
              onProgress(bytesUploaded, bytesTotal, percent);
            }
          },
          onSuccess: function () {
            resolve();
          }
        });

        return upload.findPreviousUploads().then(previousUploads => {
          if (previousUploads.length)
            upload.resumeFromPreviousUpload(previousUploads[0]);

          upload.start();
        })
      }
    }})
  });

export const uploadFile = (
  supabase: SupabaseClient, 
  file: File, 
  filename: string
) => {
  return supabase
    .storage
    .from('documents')
    .upload(filename, file);
}
