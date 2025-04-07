import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Document } from 'src/Types';
import { Spinner } from '@components/Spinner';

const CANTALOUPE_PATH: string | undefined = import.meta.env
  .PUBLIC_IIIF_CANTALOUPE_PATH;

interface IIIFImageThumbnailProps {
  document: Document;
}

export const IIIFImageThumbnail = (props: IIIFImageThumbnailProps) => {
  const { document } = props;

  const [authToken, setAuthToken] = useState<string | undefined>();

  const [thumbnailBlob, setThumbnailBlob] = useState<string | undefined>();

  const isUploadedFile = document.content_type?.startsWith('image/');

  const imageManifest = isUploadedFile
    ? `${CANTALOUPE_PATH}/${document.id}/info.json`
    : document.meta_data?.url;

  const thumbnailURL = imageManifest?.replace(
    '/info.json',
    '/square/max/0/default.jpg'
  );

  useEffect(() => {
    // Standard image tag
    if (!isUploadedFile || !thumbnailURL) return;

    supabase.auth.getSession().then(({ error, data }) => {
      if (error) {
        // Shouldn't really happen at this point
        console.error(error);
      } else {
        setAuthToken(data.session?.access_token);
      }
    });
  }, []);

  useEffect(() => {
    if (!authToken || !thumbnailURL) return;

    fetch(thumbnailURL, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          console.error('Failed thumbnail download', res);
        } else {
          res.blob().then((blob) => {
            const objectURL = URL.createObjectURL(blob);
            setThumbnailBlob(objectURL);
          });
        }
      })
      .catch((error) => {
        console.error('Failed thumbnail download', error);
      });
  }, [authToken]);

  useEffect(() => {
    // Cleanup: free resources properly on unmount
    if (!thumbnailBlob) return;

    return () => {
      URL.revokeObjectURL(thumbnailBlob);
    };
  }, [thumbnailBlob]);

  return isUploadedFile ? (
    <div className='document-card-image-container'>
      {!thumbnailBlob ? (
        <div className='spinner-container'>
          <Spinner className='search-icon spinner' size={14} />
        </div>
      ) : (
        <img
          src={thumbnailBlob}
          height={200}
          width={200}
          alt={`image ${document.name}`}
        />
      )}
    </div>
  ) : (
    <div className='document-card-image-container'>
      <img
        src={thumbnailURL}
        height={200}
        width={200}
        alt={`image ${document.name}`}
      />
    </div>
  );
};
