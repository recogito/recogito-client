import Uppy, { type UploadResult } from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE;

type Meta = {

  type: string;

}

export const uploadFile = (
  supabase: SupabaseClient, 
  file: File,
  name: string,
  onProgress?: (progress: number) => void
): Promise<void> => new Promise((resolve, reject) => {
  return supabase.auth.getSession().then(({ error, data }) => {
    if (error) {
      reject(error)
    } else {
      const token = data.session?.access_token;      
      if (!token) {
        // Shouldn't really happen at this point
        reject('Not authorized');
      } else {
        const uppy = new Uppy<Meta, any>({ autoProceed: true });

        uppy.use(XHR, {
          endpoint: `${SUPABASE_URL}/storage/v1/object/documents/${name}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        uppy.addFile({
          name,
          data: file,
          meta: { type: file.type }
        });

        uppy.on('progress', progress => {
          onProgress && onProgress(progress);
        });

        uppy.on('error', error => {
          reject(error);
        });

        uppy.upload().then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        })
      }
    }
  });
});

export const getDownloadURL = (
  supabase: SupabaseClient,
  documentId: string
): Promise<string> => new Promise((resolve, reject) => {
  supabase
    .storage
    .from('documents')
    .createSignedUrl(documentId, 60) // Valid for 60 seconds
    .then(({ data, error }) => {
      const url = data?.signedUrl;

      if (url)
        resolve(url)
      else 
        reject(error)
    });
});
