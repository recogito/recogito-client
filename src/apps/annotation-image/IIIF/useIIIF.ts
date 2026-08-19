import { useEffect, useMemo, useState } from 'react';
import type { ImageAnnotation } from '@annotorious/annotorious';
import { useDocumentIIIF } from '@recogito/studio-sdk/iiif';
import type { DocumentWithContext, EmbeddedLayer } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { parseManifestAnnotations } from '@util/iiif';

interface EmbeddedAnnotationData {

  layer: EmbeddedLayer;

  annotations: Record<string, ImageAnnotation[]>;

}

const CANTALOUPE_PATH: string | undefined = import.meta.env
  .PUBLIC_IIIF_CANTALOUPE_PATH;

const getAccessToken = () =>
  supabase.auth.getSession().then(({ data }) => data.session?.access_token);

export const useIIIF = (document: DocumentWithContext) => {

  const iiif = useDocumentIIIF(document, {
    cantaloupePath: CANTALOUPE_PATH,
    getAccessToken,
  });

  const [embeddedAnnotationData, setEmbeddedAnnotationData] =
    useState<EmbeddedAnnotationData | undefined>();

  // Parse annotations embedded in the manifest
  useEffect(() => {
    if (!iiif.manifest) return;

    const embedded = parseManifestAnnotations(iiif.manifest);
    if (embedded)
      setEmbeddedAnnotationData(embedded);
  }, [iiif.manifest]);

  const embeddedAnnotations = useMemo(() => {
    if (!embeddedAnnotationData) return;

    const id = typeof iiif.currentImage === 'string'
      ? iiif.currentImage
      : iiif.currentImage?.uri;
    if (!id) return;

    const annotations = embeddedAnnotationData.annotations[id];
    const layer = embeddedAnnotationData.layer;

    return { annotations, layer };
  }, [embeddedAnnotationData, iiif.currentImage]);

  return { ...iiif, embeddedAnnotations };
};
