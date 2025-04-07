import { useEffect, useState } from 'react';
import { Spinner } from '@components/Spinner';

interface IIIFPresentationThumbnailProps {
  manifestURL: string;
}

export const IIIFPresentationThumbnail = (
  props: IIIFPresentationThumbnailProps
) => {
  const [loading, setLoading] = useState(true);

  const [url, setURL] = useState<string | undefined>();

  useEffect(() => {
    if (!props.manifestURL) return;

    fetch(props.manifestURL)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);

        if (data.thumbnail) setURL(data.thumbnail['@id']);
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
          src={url ? url : '/img/iiif-manifest-document.png'}
          height={200}
          width={200}
          alt='I I I F manifest document'
        />
      )}
    </div>
  );
};
