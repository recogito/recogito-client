import { useEffect, useState } from 'react';
import { Utils, Manifest, Resource, Sequence } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';

type ManifestType = 'PRESENTATION' | 'IMAGE';

const CANTALOUPE_PATH: string | undefined = import.meta.env.PUBLIC_IIIF_CANTALOUPE_PATH;

// Performs a simple sanity check
const isSupported = (manifest: Manifest) => {
  // Require exactly one sequence
  if (!manifest?.getSequences() || manifest.getSequences().length !== 1)
    return false;

  const canvases = manifest.getSequences()[0].getCanvases();

  // Require a list of canvases, with length > 0
  if (!canvases || !Array.isArray(canvases) || canvases.length === 0)
    return false;

  return true;
}

/** 
 * TODO add additional checks on the document metadata, to ensure
 * we are dealing with a IIIF (image or presentation) manifest.
 */
export const useIIIF = (document: DocumentInTaggedContext) => {

  const [sequence, setSequence] = useState<Sequence | undefined>();

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  const [manifestError, setManifestError] = useState<string | undefined>();

  const [authToken, setAuthToken] = useState<string | undefined>();

  const [manifestType, setManifestType] = useState<ManifestType | undefined>();

  const images = sequence ? sequence.getCanvases().reduce<Resource[]>((images, canvas) => {
    return [...images, ...canvas.getImages().map(i => i.getResource())];
  }, []) : [];

  useEffect(() => {
    const isUploadedFile = document.content_type?.startsWith('image/');

    const url = isUploadedFile
      // Locally uploaded image - for now, assume this is served via built-in IIIF
      // TODO how to construct the right IIIF URL?
      ? `${CANTALOUPE_PATH}/${document.id}/info.json`
      : document.meta_data?.url;

    if (!url) {
      console.error('Could not resolve IIIF URL for document', document);
      return;
    }

    if (url.endsWith('info.json')) {
      if (isUploadedFile) {
        // For uploaded files, we need to include the auth token
        // into image requests
        supabase.auth.getSession().then(({ error, data }) => {
          // Get Supabase session token first
          if (error) {
            // Shouldn't really happen at this point
            console.error(error);
          } else {
            setAuthToken(data.session?.access_token) 
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
      Utils.loadManifest(url).then(data => {
        const manifest = Utils.parseManifest(data) as Manifest;

        if (isSupported(manifest)) {
          const sequence = manifest.getSequences()[0]; 
          
          const firstImage = getImageManifestURL(sequence.getCanvases()[0].getImages()[0].getResource());
          
          setSequence(sequence);
          setCurrentImage(firstImage);
          setManifestType('PRESENTATION');
        } else {
          console.log('unsupported manifest');

          setManifestError(`Unsupported IIIF manifest: ${url}`)
        }
      }).catch(error => {
        console.error('Error loading manifest', error);
      });
    }

  }, [document]);

  // Helpers
  const isPresentationManifest = manifestType === 'PRESENTATION';

  const isImageManifest = manifestType === 'IMAGE';

  const next = () => {
    if (!currentImage || images.length === 0) return;

    const idx = images.findIndex(resource => resource.id === currentImage);
    const nextIdx = Math.min(idx + 1, images.length -1);
    
    setCurrentImage(images[nextIdx].id);
  }

  const previous = () => {
    if (!currentImage || images.length === 0) return;

    const idx = images.findIndex(resource => resource.id === currentImage);
    const nextIdx = Math.max(0, idx - 1);
    
    setCurrentImage(images[nextIdx].id);
  }

  return { 
    authToken,
    currentImage,
    isPresentationManifest,
    isImageManifest,
    manifestError,
    next,
    previous,
    setCurrentImage,
    sequence
  };

}

export const getImageManifestURL = (image: Resource) => `${image.getServices()[0].id}/info.json`;

