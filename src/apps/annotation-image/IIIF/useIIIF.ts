import { useEffect, useState } from 'react';
import { Utils, Manifest, Resource } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';

/** 
 * TODO add additional checks on the document metadata, to ensure
 * we are dealing with a IIIF (image or presentation) manifest.
 */
export const useIIIF = (document: DocumentInTaggedContext) => {

  const [images, setImages] = useState<Resource[]>([]);

  const [currentImageURL, setCurrentImageURL] = useState<string | undefined>();

  const next = () => {
    if (!currentImageURL || images.length === 0) return;

    const idx = images.findIndex(resource => resource.id === currentImageURL);
    const nextIdx = Math.min(idx + 1, images.length -1);
    
    setCurrentImageURL(images[nextIdx].id);
  }

  const previous = () => {
    if (!currentImageURL || images.length === 0) return;

    const idx = images.findIndex(resource => resource.id === currentImageURL);
    const nextIdx = Math.max(0, idx - 1);
    
    setCurrentImageURL(images[nextIdx].id);
  }

  useEffect(() => {
    if (document.meta_data?.url) {
      const { url } = document.meta_data;

      if (url.endsWith('info.json')) {
        setCurrentImageURL(url);
      } else {
        Utils.loadManifest(url).then(manifest => {
          const canvases = (Utils.parseManifest(manifest) as Manifest).getSequences()[0].getCanvases();

          const imageResources = canvases.reduce<Resource[]>((images, canvas) => {
            return [...images, ...canvas.getImages().map(i => i.getResource())];
          }, []);

          setImages(imageResources);
          setCurrentImageURL(imageResources[0].id);
        })
      }
    }
  }, [document.meta_data?.url]);

  return { currentImage: currentImageURL, next, previous };

}
