import Uppy from '@uppy/core';
import XHR from '@uppy/xhr-upload';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccessToken } from './accessToken';

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
  return getAccessToken(supabase).then(initialToken => {
    const uppy = new Uppy({ autoProceed: true });

    uppy.use(XHR, {
      endpoint: `/api/images`,

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
      data: file
    });
  
    uppy.on('progress', progress => onProgress?.(progress));

    uppy.on('error', error => {
      reject(error);
    });
  
    uppy.upload().then(result => {
      const failed = result?.failed || [];

      if (failed.length > 0) {
        reject(new Error(failed[0].error || `Upload failed for ${name}`));
        return;
      }

      const response = 
        result?.successful?.[0]?.response?.body?.resource as unknown as IIIFResponse;

      if (!response) {
        console.error(result);
        reject(new Error(`Upload of ${name} did not return a IIIF resource`));
        return;
      }

      // This is a bit of a hack... but the IIIF server doesn't
      // currently return the info.json link explicitly
      response.manifest_iiif_url = 
        response.content_iiif_url.replace('full/max/0/default.jpg', 'info.json');
      
      resolve(response);
    }).catch(error => {
      reject(error);
    });
  }).catch(error => {
    reject(error);
  });
});
