import { useEffect, useState } from 'react';
import { Utils } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';

export const useIIIFSource = (document: DocumentInTaggedContext) => {

  const [images, setImages] = useState<string[]>([]);

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  const next = () => {
    if (!currentImage) return;

    const idx = images.indexOf(currentImage);
    const nextIdx = Math.min(idx + 1, images.length -1);
    
    setCurrentImage(images[nextIdx]);
  }

  const previous = () => {
    if (!currentImage) return;

    const idx = images.indexOf(currentImage);
    const nextIdx = Math.max(0, idx - 1);
    
    setCurrentImage(images[nextIdx]);
  }

  useEffect(() => {
    if (document.meta_data?.url) {
      const { url } = document.meta_data;

      if (url.endsWith('info.json')) {
        setImages([url]);
        setCurrentImage(url);
      } else {
        // For now, assume presentation manifest
        Utils.loadManifest(url).then(manifest => {
          // Sigh - manifest has TypeScript types, but they are either wrong or incomplete
          // @ts-ignore
          const canvases = Utils.parseManifest(manifest).getSequences()[0].getCanvases();

          // @ts-ignore
          const images = canvases.reduce<string[]>((images, canvas) => {
            // @ts-ignore
            return [...images, ...canvas.getImages().map(i => i.getResource().id)];
          }, []);

          setImages(images);
          setCurrentImage(images[0]);
        })
      }
    }
  }, [document.meta_data?.url]);

  return { currentImage, next, previous };

}
