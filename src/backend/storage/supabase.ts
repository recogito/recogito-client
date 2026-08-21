import Uppy from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccessToken } from './accessToken';

const DEFAULT_BUCKET_NAME = 'documents';

const SUPABASE_URL = import.meta.env?.PUBLIC_SUPABASE || process.env?.PUBLIC_SUPABASE;

type Meta = {

  type: string;

}

export const uploadFile = (
  supabase: SupabaseClient,
  file: File,
  name: string,
  onProgress?: (progress: number) => void
): Promise<void> => new Promise((resolve, reject) => {
  return getAccessToken(supabase).then(initialToken => {
    const uppy = new Uppy<Meta, any>({ autoProceed: true });

    uppy.use(XHR, {
      endpoint: `${SUPABASE_URL}/storage/v1/object/documents/${name}`,

      onBeforeRequest: async (xhr) => {
        let token = initialToken;

        try {
          token = await getAccessToken(supabase);
        } catch (error) {
          console.warn('Could not refresh access token before upload', error);
        }

        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
    });

    uppy.addFile({
      name,
      data: file,
      meta: { type: file.type }
    });

    uppy.on('progress', progress => onProgress?.(progress));

    uppy.on('error', error => {
      reject(error);
    });

    uppy.upload().then(result => {
      const failed = result?.failed || [];

      if (failed.length > 0) {
        reject(new Error(failed[0].error || `Upload failed for ${name}`));
      } else {
        resolve();
      }
    }).catch(error => {
      reject(error);
    });
  }).catch(error => {
    reject(error);
  });
});

export const getDownloadURL = (
  supabase: SupabaseClient,
  documentId: string,
  bucket: string = DEFAULT_BUCKET_NAME
): Promise<string> => new Promise((resolve, reject) => {
  supabase
    .storage
    .from(bucket)
    .createSignedUrl(
      documentId,
      60, // Valid for 60 seconds
      { download: `project-export-${documentId}.zip` }
    )
    .then(({ data, error }) => {
      const url = data?.signedUrl;

      if (url)
        resolve(url)
      else 
        reject(error)
    });
});
