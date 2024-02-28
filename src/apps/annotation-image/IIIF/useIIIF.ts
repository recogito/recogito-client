import { useEffect, useState } from 'react';
import { Utils, Manifest, Resource, Sequence } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';

type ManifestType = 'PRESENTATION' | 'IMAGE';

/** 
 * TODO add additional checks on the document metadata, to ensure
 * we are dealing with a IIIF (image or presentation) manifest.
 */
export const useIIIF = (document: DocumentInTaggedContext) => {

  const [sequence, setSequence] = useState<Sequence | undefined>();

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  const [manifestType, setManifestType] = useState<ManifestType | undefined>();

  const images = sequence ? sequence.getCanvases().reduce<Resource[]>((images, canvas) => {
    return [...images, ...canvas.getImages().map(i => i.getResource())];
  }, []) : [];

  useEffect(() => {
    if (document.meta_data?.url) {
      const { url } = document.meta_data;

      if (url.endsWith('info.json')) {
        setCurrentImage(url);
        setManifestType('IMAGE');
      } else {
        Utils.loadManifest(url).then(manifest => {
          const sequence = (Utils.parseManifest(manifest) as Manifest).getSequences()[0];

          // Hm... this makes a whole lot of assumptions about the manifest. 
          // TODO run some kind of initial validation/sanity check and display
          // a message to the user if this fails
          const firstImage = sequence.getCanvases()[0].getImages()[0].getResource().id;

          setSequence(sequence);
          setCurrentImage(firstImage);
          setManifestType('PRESENTATION');
        })
      }
    }
  }, [document.meta_data?.url]);

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
    currentImage,
    isPresentationManifest,
    isImageManifest,
    next,
    previous,
    setCurrentImage,
    sequence
  };

}
