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

export interface IIIFRecord {
  
  name: string;

  content_thumbnail_url: string;

  content_preview_url: string

  content_iiif_url: string;

  content_download_url: string;

  content_type: string;

}

export const uploadImage = (
  supabase: SupabaseClient,
  file: File,
  name: string,
  onProgress?: (progress: number) => void
): Promise<IIIFRecord | undefined> => new Promise((resolve, reject) => {
  supabase.auth.getSession().then(({ error, data }) => {
    // Get Supabase session token first
    if (error) {
      // Shouldn't really happen at this point
      reject(error);
    } else {
      const token = data.session?.access_token;      
      if (!token) {
        // Shouldn't really happen at this point
        reject('Not authorized');
      } else {
        // User is properly logged in - upload image file
        // to IIIF storage proxy
        const uppy = new Uppy({ autoProceed: true });

        uppy.use(XHR, {
          endpoint: `/api/images`,
          headers: {
            // Storage proxy requires authentication 
            'Authorization': `Bearer ${token}`
          }
        });
      
        uppy.addFile({
          name,
          data: file
        });
      
        uppy.on('progress', progress => {
          onProgress && onProgress(progress);
        });
      
        uppy.upload().then(result => {
          if (result.successful.length === 1) {
            const { response } = result.successful[0];
            resolve(response?.body as unknown as IIIFRecord);
          } else {
            console.error(result);
            reject(result);
          }
        });
      }
    }
  });
});