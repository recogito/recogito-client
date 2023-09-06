import Uppy from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface IIIFResponse {
  
  name: string;

  content_thumbnail_url: string;

  content_preview_url: string

  content_iiif_url: string;

  content_download_url: string;

  content_type: string;

  manifest_iiif_url: string;

}

export const uploadImage = (
  supabase: SupabaseClient,
  file: File,
  name: string,
  onProgress?: (progress: number) => void
): Promise<IIIFResponse> => new Promise((resolve, reject) => {
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
            const response = 
              result.successful[0].response?.body?.resource as unknown as IIIFResponse;

            if (!response) {
              reject(result);
            } else {
              // This is a bit of a hack... but the IIIF server doesn't
              // currently return the info.json link explicitely
              response.manifest_iiif_url = 
                response.content_iiif_url.replace('full/max/0/default.jpg', 'info.json');
              
              resolve(response);
            }
          } else {
            console.error(result);
            reject(result);
          }
        });
      }
    }
  });
});