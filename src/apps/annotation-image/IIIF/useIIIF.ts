import { useEffect, useState } from 'react';
import { Canvas, IIIF } from '@allmaps/iiif-parser';
import type { DocumentWithContext } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';

type ManifestType = 'PRESENTATION' | 'IMAGE';

const CANTALOUPE_PATH: string | undefined = import.meta.env
  .PUBLIC_IIIF_CANTALOUPE_PATH;

export const useIIIF = (document: DocumentWithContext) => {

  const [canvases, setCanvases] = useState<Canvas[]>([]);

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  const [manifestError, setManifestError] = useState<string | undefined>();

  const [authToken, setAuthToken] = useState<string | undefined>();

  const [manifestType, setManifestType] = useState<ManifestType | undefined>();

  useEffect(() => {
    const isUploadedFile = document.content_type?.startsWith('image/');

    const url = isUploadedFile
      ? // Locally uploaded image - for now, assume this is served via built-in IIIF
        `${CANTALOUPE_PATH}/${document.id}/info.json`
      : document.meta_data?.url;

    if (!url) {
      console.error('Could not resolve IIIF URL for document', document);
      return;
    }

    if (url.endsWith('info.json')  || url.includes('info.json?')) {
      if (isUploadedFile) {
        // For uploaded files, we need to include the auth token
        // into image requests
        supabase.auth.getSession().then(({ error, data }) => {
          // Get Supabase session token first
          if (error) {
            // Shouldn't really happen at this point
            console.error(error);
          } else {
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
          setCurrentImage(`${parsed.canvases[0]?.image.uri}/info.json`);
          setManifestType('PRESENTATION');
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

    const idx = canvases.findIndex(c => `${c.image.uri}/info.json` === currentImage);
    const nextIdx = Math.min(idx + 1, canvases.length - 1);

    setCurrentImage(`${canvases[nextIdx].image.uri}/info.json`);
  };

  const previous = () => {
    if (!currentImage || canvases.length === 0) return;

    const idx = canvases.findIndex(c => `${c.image.uri}/info.json` === currentImage);
    const nextIdx = Math.max(0, idx - 1);

    setCurrentImage(`${canvases[nextIdx].image.uri}/info.json`);
  };

  return {
    authToken,
    canvases,
    currentImage,
    isPresentationManifest,
    isImageManifest,
    manifestError,
    next,
    previous,
    setCurrentImage,
  };
};
