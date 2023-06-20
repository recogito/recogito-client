import type { SupabaseClient } from '@supabase/supabase-js';
import { initDocument } from './documentHelpers';
import type { Document, Layer } from 'src/Types';
import { uploadFile } from '@backend/storage';
import type { UploadResult as UppyResult } from '@uppy/core';

interface UploadResult {

  document?: Document;

  defaultLayer?: Layer;

  result: UppyResult;

}

/**
 * Note that multi-upload is currently not possible with Supabase, until
 * the resumable uploads feature is fully rolled out!
 * 
 * This method just chains a single initDocument + upload file.
 */
const uploadOneDocument = (
  supabase: SupabaseClient,
  file: File,
  projectId: string,
  contextId: string
): Promise<UploadResult> => initDocument(
  supabase,
  file.name, 
  projectId,
  contextId, 
  file
).then(({ document, defaultLayer }) =>
  uploadFile(supabase, file, document.id).then(result => ({
    document, defaultLayer, result
  })));

export const uploadDocuments = (
  supabase: SupabaseClient, 
  files: File[],
  projectId: string, 
  contextId: string,
): Promise<UploadResult[]> => new Promise((resolve, reject) =>
  files.reduce((previousPromise, file) =>
    previousPromise.then(results =>
      new Promise(resolve => {
        uploadOneDocument(supabase, file, projectId, contextId)
          .then(result => {
            resolve([...results, result ])
          })
      })
    ), Promise.resolve([] as UploadResult[])));