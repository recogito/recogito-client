import type { SupabaseClient } from '@supabase/supabase-js';
import { createDocument, createProjectDocument } from '@backend/crud';
import { createLayerInContext } from './layerHelpers';
import { uploadFile, uploadImage } from '@backend/storage';
import type { Response } from '@backend/Types';
import type { Document, Layer, Protocol, TaggedContext } from 'src/Types';
import type { DocumentWithContext } from '../../Types';

/**
 * Initializes a new Document in a Context. Process differs for
 * different types of content.
 *
 * - For IIIF remote sources, only the URL of the manifest is stored in Supabase
 * - Text and TEI documents are uploaded to Supabase storage
 * - Images are uploaded to the IIIF server, and a reference to the image
 *   manifest stored in Supabase
 */
export const initDocument = (
  supabase: SupabaseClient,
  name: string,
  projectId: string,
  contextId: string,
  onProgress?: (progress: number) => void,
  file?: File,
  url?: string,
  protocol?: Protocol
): Promise<Document> => {
  if (file?.type.startsWith('image')) {
    // If the document is an image upload, the file is first
    // uploaded to the IIIF server, and then treated like a remote
    // IIIF source.
    return uploadImage(supabase, file, name, onProgress).then((iiif) =>
      _initDocument(
        supabase,
        name,
        projectId,
        contextId,
        undefined,
        undefined,
        'IIIF_IMAGE',
        iiif.manifest_iiif_url
      )
    );
  } else {
    return _initDocument(
      supabase,
      name,
      projectId,
      contextId,
      onProgress,
      file,
      protocol,
      url
    );
  }
};

/**
 * Initializes a text (plaintext, TEI) or remote IIIF document.
 *
 * Procedure is as follows:
 * 1. A `document` record is created in Supabase.
 * 2. A default `layer` on the document is created in the given context. (Happens in parallel.)
 * 3. After step 1 and 2 have completed:
 *    - the method returns if the document is a remote IIIF source
 *    - the text file is uploaded to Supabase storage, with a reference to the document ID
 */
const _initDocument = (
  supabase: SupabaseClient,
  name: string,
  projectId: string,
  contextId: string,
  onProgress?: (progress: number) => void,
  file?: File,
  protocol?: Protocol,
  url?: string
): Promise<Document> => {
  // First promise: create the document
  const a: Promise<Document> = new Promise((resolve, reject) =>
    createDocument(
      supabase,
      name,
      file?.type,
      protocol
        ? {
            protocol,
            url,
          }
        : undefined
    ).then(({ error, data }) => {
      if (error) {
        reject(error);
      } else {
        createProjectDocument(supabase, data.id, projectId).then(
          ({ error: pdError, data: _projectDocument }) => {
            if (pdError) {
              reject(error);
            } else {
              resolve(data);
            }
          }
        );
      }
    })
  );

  // Second promise: create layer in the default context
  const b: Promise<Layer> = a.then((document) =>
    createLayerInContext(supabase, document.id, projectId, contextId)
  );

  return Promise.all([a, b]).then(([document, defaultLayer]) => {
    if (file) {
      return uploadFile(supabase, file, document.id, onProgress).then(() => ({
        ...document,
        layers: [defaultLayer],
      }));
    } else {
      return { ...document, layers: [defaultLayer] };
    }
  });
};

export const addDocumentToProject = (
  supabase: SupabaseClient,
  projectId: string,
  documentId: string
): Response<Document> =>
  createProjectDocument(supabase, documentId, projectId).then(
    ({ error, data }) => {
      if (error || !data) {
        return { error: error, data: null };
      }

      return supabase.from('documents').select().eq('id', documentId);
    }
  );

export const removeDocumentsFromProject = (
  supabase: SupabaseClient,
  projectId: string,
  documentIds: [string]
): Response<boolean> =>
  supabase
    .rpc('archive_project_documents_rpc', {
      _document_ids: documentIds,
      _project_id: projectId,
    })
    .then(({ error, data }) => {
      return { error, data };
    });

export const listDocumentsInProject = (
  supabase: SupabaseClient,
  projectId: string
): Response<Document[]> =>
  supabase
    .from('project_documents')
    .select(
      `
      *,
      document:document_id (
        id,
        created_at,
        created_by,
        updated_at,
        updated_by,
        name,
        bucket_id,
        content_type,
        meta_data,
        is_private
      )
      `
    )
    .eq('project_id', projectId)
    .then(({ error, data }) => {
      if (error) {
        return { error, data: [] };
      } else {
        const docs: Document[] = data.map((datum) => datum.document);
        return { error, data: docs };
      }
    });

export const listDocumentsInContext = (
  supabase: SupabaseClient,
  contextId: string
): Response<Document[]> =>
  supabase
    .from('context_documents')
    .select(
      `
      *,
      document:document_id (
        id,
        created_at,
        created_by,
        updated_at,
        updated_by,
        name,
        bucket_id,
        content_type,
        meta_data,
        is_private
      )
    `
    )
    .eq('context_id', contextId)
    .then(({ error, data }) => {
      if (error) {
        return { error, data: [] };
      } else {
        const docs: Document[] = data.map((datum) => datum.document);
        return { error, data: docs };
      }
    });

export const getDocumentInContext = (
  supabase: SupabaseClient,
  documentId: string,
  contextId: string
): Response<DocumentWithContext | null> =>
  supabase
    .from('documents')
    .select(
      `
      id,
      created_at,
      created_by,
      updated_at,
      updated_by,
      name,
      bucket_id,
      content_type,
      meta_data,
      is_private,
      collection_id
    `
    )
    .eq('id', documentId)
    .single()
    .then(({ error, data }) => {
      if (error) {
        return { error, data: null };
      }
      const document: any = data;
      // Now get the layers
      return supabase
        .from('contexts')
        .select(
          `
          id,
          name,
          description,
          project_id,
          is_project_default,
          layer_contexts(
            id,
            is_active_layer,
            layer: layers(
              id,
              document_id,
              name,
              description
            )
          )
        `
        )
        .eq('id', contextId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            return { error, data: null };
          }

          console.log('Layer Context: ', data);
          document.layers = data.layer_contexts
            .filter((c) => c.layer.document_id === documentId)
            .map((layerContext) => ({
              id: layerContext.layer.id,
              is_active: layerContext.is_active_layer,
              document_id: documentId,
            }));
          const context = data;

          delete context.layer_contexts;
          document.context = context;

          console.log('Doc: ', document);
          return { error: null, data: document };
        });
    });

export const listAllDocuments = (
  supabase: SupabaseClient
): Response<Document[] | null> =>
  // @ts-ignore
  supabase
    .from('documents')
    .select(
      'id,created_at,created_by,updated_at,updated_by,name,bucket_id,content_type,meta_data'
    )
    .then(({ error, data }) => {
      return { error, data };
    });

export const isDefaultContext = (context: TaggedContext) =>
  context.tags?.length > 0 &&
  context.tags.some(
    (t) =>
      t.tag_definition?.scope === 'system' &&
      t.tag_definition?.name === 'DEFAULT_CONTEXT'
  );
