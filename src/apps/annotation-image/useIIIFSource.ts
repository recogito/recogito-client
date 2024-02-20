import { useEffect, useState } from 'react';
import { Utils } from 'manifesto.js';
import type { DocumentInTaggedContext } from 'src/Types';

export const useIIIFSource = (document: DocumentInTaggedContext) => {

  const [currentImage, setCurrentImage] = useState<string | undefined>();

  useEffect(() => {
    if (document.meta_data?.url) {
      const { url } = document.meta_data;

      if (url.endsWith('info.json')) {
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

          setCurrentImage(images[200]);
        })

      }
    }
  }, [document.meta_data?.url]);

  return currentImage;

}
