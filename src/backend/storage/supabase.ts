import Uppy, { UploadResult } from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import type { SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = `https://${import.meta.env.PUBLIC_SUPABASE}`;

export const uploadFile = (
  supabase: SupabaseClient, 
  file: File,
  name: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => new Promise((resolve, reject) => {
  return supabase.auth.getSession().then(({ error, data }) => {
    if (error) {
      reject(error)
    } else {
      const token = data.session?.access_token;      
      if (!token) {
        reject('Not authorized');
      } else {
        const uppy = new Uppy({ autoProceed: true });

        uppy.use(XHR, {
          endpoint: `${SUPABASE_URL}/storage/v1/object/documents/${name}`,
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        uppy.addFile({
          name,
          type: file.type,
          data: file
        });

        uppy.on('progress', progress => {
          onProgress && onProgress(progress);
        });

        uppy.upload().then(result => {
          resolve(result);
        });
      }
    }
  });
});
