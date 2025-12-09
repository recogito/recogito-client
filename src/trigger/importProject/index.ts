import { updateDocumentMetadata } from '@backend/crud';
import { getDownloadURL } from '@backend/storage';
import { createClient, PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import { logger, task } from '@trigger.dev/sdk/v3';
import { generatePassword } from '@util/auth';
import AdmZip from 'adm-zip';
import { v4 as uuidv4 } from 'uuid';

interface Payload {
  key: string;
  jobId: string;
  serverURL: string;
  token: string;
}

const IIIF_KEY = process.env.IIIF_KEY || process.env.RECOGITO_TIGER;
const IIIF_URL = process.env.IIIF_URL;
const IIIF_PROJECT_ID = process.env.IIIF_PROJECT_ID;

const SUPABASE_SERVER_URL = process.env.SUPABASE_SERVERCLIENT_URL || process.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY = process.env.PUBLIC_SUPABASE_API_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const DOCUMENTS_PREFIX = 'documents/';
const JSON_EXTENSION = '.json';

const PASSWORD_LENGTH = 14;

const createDocuments = async (
  supabase: SupabaseClient,
  importId: string,
  zip: AdmZip
) => {
  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const { entryName } = zipEntry;

    if (entryName.startsWith(DOCUMENTS_PREFIX)) {
      logger.info(`Uploading document ${ entryName }`);

      const documentId = entryName.replace(DOCUMENTS_PREFIX, '');

      const { data } = await supabase
        .schema('etl')
        .from('z_documents')
        .select('id, name, bucket_id, meta_data')
        .eq('legacy_id', documentId)
        .eq('is_new', true)
        .eq('import_id', importId)
        .single();

      const {
        id,
        name,
        bucket_id: bucketId,
        meta_data: metadata = {}
      } = data || {};

      const file = zip.readFile(zipEntry);

      if (file) {
        if (id && bucketId) {
          logger.info(`Uploading file: ${ id }`);

          const { data, error } = await uploadFile(supabase, id, file);

          if (error) {
            logger.error(`Error uploading file: ${id}`);
            logger.error(error.message);
          } else {
            logger.info(`Successfully uploaded file: ${id}`);
            logger.info(data?.path);
          }

        } else if (id && metadata?.protocol === 'IIIF_IMAGE') {
          logger.info(`Uploading image: ${id}`);

          const { resource } = await uploadImage(name, file);
          const url = resource.content_iiif_url.replace('full/max/0/default.jpg', 'info.json');

          const { data, error } = await updateDocumentMetadata(supabase, id, name, { ...metadata, url });

          if (error) {
            logger.error(`Error uploading image: ${id}`);
            logger.error(error.message);
          } else {
            logger.info(`Successfully uploaded image: ${id}`);
            logger.info(data?.id);
          }
        } else {
          logger.info(`Skipping upload for document ${ entryName }`);
        }
      }
    }
  }
};

const createUsers = async (
  supabase: SupabaseClient,
  importId: string
) => {
  if (!(SUPABASE_SERVER_URL && SUPABASE_SERVICE_KEY)) {
    logger.error('Invalid admin credentials');
    return;
  }

  const { data: profiles } = await supabase
    .schema('etl')
    .from('z_profiles')
    .select('email')
    .eq('import_id', importId)
    .eq('is_new', true);

  if (profiles) {
    // Import jobs can only ever be run by an org admin user, so we'll use the service key to create the user
    const supa = await createClient(SUPABASE_SERVER_URL, SUPABASE_SERVICE_KEY);

    for (const profile of profiles) {
      await supa.auth.admin.createUser({
        email: profile.email,
        password: generatePassword(PASSWORD_LENGTH)
      });
    }
  }
};

const extract = async (
  supabase: SupabaseClient,
  importId: string,
  zip: AdmZip
) => {
  const zipEntries = zip.getEntries();

  for (const zipEntry of zipEntries) {
    const { entryName } = zipEntry;

    if (entryName.endsWith(JSON_EXTENSION)) {
      logger.info(`Extracting ${entryName}`);

      const content = zip.readAsText(entryName);
      const records = getRecords(importId, entryName, content);
      const tableName = `z_${entryName.replace(JSON_EXTENSION, '')}`;

      const { error } = await supabase
        .schema('etl')
        .from(tableName)
        .insert(records);

      if (error) {
        logError(`Error inserting into ${tableName}`, error);
      } else {
        logger.info(`Successfully inserted ${records.length} records into ${tableName}`);
      }
    }
  }
};

const getRecords = (
  importId: string,
  entryName: string,
  content: string
) => {
  let records;

  try {
    const items = JSON.parse(content);
    records = items?.map((item: any) => {
      const { id, ...rest } = item;

      return {
        legacy_id: id,
        import_id: importId,
        ...rest
      };
    });
  } catch (e) {
    logger.error(`Error parsing ${entryName}`);
    logger.error((e as Error).message);

    records = [];
  }

  return records;
};

const load = async (
  supabase: SupabaseClient,
  importId: string
) => {
  const { error } = await supabase
    .schema('etl')
    .rpc('load_rpc', { _import_id: importId });

  if (error) {
    logError(`Error loading data: ${importId}`, error);
  } else {
    logger.info(`Successfully loaded data: ${importId}`);
  }
};

const logError = (
  message: string,
  error: PostgrestError
) => {
  logger.error(message);
  logger.error(`Code: ${error.code} Details: ${error.details} Message: ${error.message}`);
};

const transform = async (
  supabase: SupabaseClient,
  importId: string
) => {
  const { error } = await supabase
    .schema('etl')
    .rpc('transform_rpc', { _import_id: importId });

  if (error) {
    logError(`Error transforming data: ${importId}`, error);
  } else {
    logger.info(`Successfully transformed data: ${importId}`);
  }
};

const uploadFile = async (
  supabase: SupabaseClient,
  name: string,
  file: Buffer
) =>
  supabase
    .storage
    .from('documents')
    .upload(name, file)

const uploadImage = async (
  name: string,
  buffer: Buffer
) => {
  if (!(IIIF_PROJECT_ID && IIIF_URL && IIIF_KEY)) {
    logger.error('Invalid IIIF credentials');
    return;
  }

  const data = new Uint8Array(buffer).buffer;
  const file = new File([data], name);

  // Forward as outgoing FormData
  const formData = new FormData();
  formData.append('resource[name]', name);
  formData.append('resource[project_id]', IIIF_PROJECT_ID);
  formData.append('resource[content]', file);

  const response = await fetch(IIIF_URL, {
    body: formData,
    headers: {
      'X-API-KEY': IIIF_KEY,
    },
    method: 'POST'
  });

  return response.json();
};

export const importProject = task({
  id: 'import-project',
  run: async (payload: Payload) => {
    const { jobId, token } = payload;

    if (!(SUPABASE_SERVER_URL && SUPABASE_API_KEY)) {
      logger.error('Invalid Supabase credentials');
      return;
    }

    const importId = uuidv4();
    logger.info(`Generating import ID: ${importId}`);

    logger.info('Creating Supabase client');

    const supabase = createClient(SUPABASE_SERVER_URL, SUPABASE_API_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    });

    const url = await getDownloadURL(supabase, jobId, 'jobs');

    const fileResp = await fetch(url);
    const buffer = await fileResp.arrayBuffer();
    const zip = new AdmZip(Buffer.from(buffer));

    // Extract the data to temporary tables
    await extract(supabase, importId, zip);

    // Update foreign keys
    await transform(supabase, importId);

    // Load the data into the database tables
    await load(supabase, importId);

    // Create documents in storage
    await createDocuments(supabase, importId, zip);

    // Create users in auth schema
    await createUsers(supabase, importId);

    logger.info(`Completed import: ${importId}`);
  }
});