import { useEffect, useState } from 'react';
import { Spinner } from '@components/Spinner';

interface IIIFPresentationThumbnailProps {
  manifestURL: string;
}

const FALLBACK_IMAGE = '/img/iiif-manifest-document.png';

export const IIIFPresentationThumbnail = (
  props: IIIFPresentationThumbnailProps
) => {
  const [loading, setLoading] = useState(true);

  const [url, setURL] = useState<string>(FALLBACK_IMAGE);

  useEffect(() => {
    if (!props.manifestURL) return;

    fetch(props.manifestURL)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);

        if (data.thumbnail) {
          // use thumb if present
          const thumbId =
            data.thumbnail['@id'] || data.thumbnail[0]?.id || data.thumbnail.id;
          if (thumbId) {
            setURL(thumbId);
            return;
          }
        }

        // try to get thumbnail from first canvas
        const sequences = data.sequences || [];
        const canvases =
          data.items || (sequences[0] && sequences[0].canvases) || [];
        const firstCanvas = canvases[0];

        if (firstCanvas) {
          if (firstCanvas.thumbnail) {
            const thumbId =
              firstCanvas.thumbnail['@id'] ||
              firstCanvas.thumbnail[0]?.id ||
              firstCanvas.thumbnail.id;
            if (thumbId) {
              setURL(thumbId);
              return;
            }
          }

          // otherwise attempt to generate one with IIIF image API
          const image =
            firstCanvas.images?.[0]?.resource ||
            firstCanvas.items?.[0]?.items?.[0]?.body;
          const service = image?.service?.[0] || image?.service;
          const serviceId = service?.['@id'] || service?.id;

          if (serviceId) {
            setURL(
              `${serviceId.replace(/\/$/, '')}/full/!256,256/0/default.jpg`
            );
            return;
          }
        }
      });
  }, [props.manifestURL]);

  return (
    <div className='document-card-image-container'>
      {loading ? (
        <div className='spinner-container'>
          <Spinner className='search-icon spinner' size={14} />
        </div>
      ) : (
        <img
          src={url}
          height={200}
          width={200}
          alt='IIIF manifest document'
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      )}
    </div>
  );
};
