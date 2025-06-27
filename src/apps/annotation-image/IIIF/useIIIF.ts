import { useEffect, useMemo, useState } from 'react';
import type { ImageAnnotation } from '@annotorious/annotorious';
import { Canvas, IIIF, type Metadata } from '@allmaps/iiif-parser';
import type { DocumentWithContext, EmbeddedLayer } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { parseManifestAnnotations } from '@util/iiif';

type ManifestType = 'PRESENTATION' | 'IMAGE';

interface EmbeddedAnnotationData {

  layer: EmbeddedLayer;

  annotations: Record<string, ImageAnnotation[]>;

}

const CANTALOUPE_PATH: string | undefined = import.meta.env
  .PUBLIC_IIIF_CANTALOUPE_PATH;

export type IIIFImage = string | Canvas; 

// IIIF mandates that URIs are without 'info.json', but doesn't 
// say anything about with our without trailing slash AFAIK. 
// Needless to say: people will still sometimes append the '/info.json'
// in the real world... this helper should cover all flavours.
export const getImageURL = (image: IIIFImage) => {
  if (!image) return;

  if (typeof image === 'string') return image;

  const uri = image?.image.uri;

  if (!uri) {
    console.error('Missing image URI on canvas', image);
    return;
  }

  return uri.endsWith('info.json') ? uri : `${uri.endsWith('/') ? uri : `${uri}/`}info.json`;
}

export const useIIIF = (document: DocumentWithContext) => {

  const [canvases, setCanvases] = useState<Canvas[]>([]);

  const [manifestError, setManifestError] = useState<string | undefined>();

  const [metadata, setMetadata] = useState<Metadata | undefined>();
  
  const [embeddedAnnotationData, setEmbeddedAnnotationData] = useState<EmbeddedAnnotationData | undefined>();

  const [authToken, setAuthToken] = useState<string | undefined>();

  const [manifestType, setManifestType] = useState<ManifestType | undefined>();

  const [currentImage, setCurrentImage] = useState<IIIFImage | undefined>();

  useEffect(() => {
    const isUploadedFile = document.content_type?.startsWith('image/');

    console.log('[useIIIF] isUploadedFile?', isUploadedFile);

    const url = isUploadedFile
      ? // Locally uploaded image - for now, assume this is served via built-in IIIF
        `${CANTALOUPE_PATH}/${document.id}/info.json`
      : document.meta_data?.url;

    console.log('url', url);

    if (!url) {
      console.error('Could not resolve IIIF URL for document', document);
      return;
    }

    if (url.endsWith('info.json')  || url.includes('info.json?')) {
      if (isUploadedFile) {
        console.log('inserting auth token...');

        // For uploaded files, we need to include the auth token
        // into image requests
        supabase.auth.getSession().then(({ error, data }) => {
          // Get Supabase session token first
          if (error) {
            // Shouldn't really happen at this point
            console.error(error);
          } else {
            console.log('setting token', data.session?.access_token);
            setAuthToken(data.session?.access_token);
            setCurrentImage(url);
            setManifestType('IMAGE');
          }
        });
      } else {
        // Remote image API manifest
        setCurrentImage(url);
        setManifestType('IMAGE');
      }
    } else {
      fetch(url).then(res => res.json()).then(data => {
        const parsed = IIIF.parse(data);
        if (parsed.type === 'manifest') {
          setCanvases(parsed.canvases);
          setCurrentImage(parsed.canvases[0]);
          setManifestType('PRESENTATION');
          setMetadata(parsed.metadata);

          const embeddedAnnotations = parseManifestAnnotations(parsed);
          if (embeddedAnnotations)
            setEmbeddedAnnotationData(embeddedAnnotations);
        } else {
          console.log('Failed to parse IIIF manifest', parsed);
          setManifestError(`Failed to parse IIIF manifest: ${url}`);
        }
      });
    }
  }, [document]);

  // Helpers
  const isPresentationManifest = manifestType === 'PRESENTATION';

  const isImageManifest = manifestType === 'IMAGE';

  const next = () => {
    if (!currentImage || canvases.length === 0) return;

    const idx = canvases.findIndex(c => c.uri === (currentImage as Canvas).uri);
    const nextIdx = Math.min(idx + 1, canvases.length - 1);

    setCurrentImage(canvases[nextIdx]);
  };

  const previous = () => {
    if (!currentImage || canvases.length === 0) return;

    const idx = canvases.findIndex(c => c.uri === (currentImage as Canvas).uri);
    const nextIdx = Math.max(0, idx - 1);

    setCurrentImage(canvases[nextIdx]);
  };

  const embeddedAnnotations = useMemo(() => {
    if (!embeddedAnnotationData) return;

    const id = typeof currentImage === 'string' ? currentImage : currentImage?.uri;
    if (!id) return;

    const annotations = embeddedAnnotationData.annotations[id];
    const layer = embeddedAnnotationData.layer;

    return { annotations, layer };
  }, [embeddedAnnotationData, currentImage]);

  return {
    authToken,
    canvases,
    currentImage,
    isPresentationManifest,
    isImageManifest,
    manifestError,
    metadata,
    embeddedAnnotations,
    next,
    previous,
    setCurrentImage,
  };
};
