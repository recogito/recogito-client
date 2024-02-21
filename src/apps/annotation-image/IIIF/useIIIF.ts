import { useEffect, useState } from 'react';
import { Utils, Manifest, Resource, Sequence } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';

/** 
 * TODO add additional checks on the document metadata, to ensure
 * we are dealing with a IIIF (image or presentation) manifest.
 */
export const useIIIF = (document: DocumentInTaggedContext) => {

  const [sequence, setSequence] = useState<Sequence | undefined>();

  const [images, setImages] = useState<Resource[]>([]);

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  useEffect(() => {
    if (document.meta_data?.url) {
      const { url } = document.meta_data;

      if (url.endsWith('info.json')) {
        setCurrentImage(url);
      } else {
        Utils.loadManifest(url).then(manifest => {
          const sequence = (Utils.parseManifest(manifest) as Manifest).getSequences()[0];

          const imageResources = sequence.getCanvases().reduce<Resource[]>((images, canvas) => {
            return [...images, ...canvas.getImages().map(i => i.getResource())];
          }, []);

          setSequence(sequence);
          setImages(imageResources);
          setCurrentImage(imageResources[0].id);
        })
      }
    }
  }, [document.meta_data?.url]);

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

  return { sequence, images, currentImage, setCurrentImage, next, previous };

}
