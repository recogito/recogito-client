import React, { useState } from 'react';
import type { Document } from 'src/Types';
import { ContentTypeIcon } from '@components/DocumentCard/ContentTypeIcon';
import './DocumentCardThumbnail.css';
import { Spinner } from '@components/Spinner';

const CANTALOUPE_PATH: string | undefined = import.meta.env
  .PUBLIC_IIIF_CANTALOUPE_PATH;

export interface DocumentCardThumbnailProps {
  document: Document;
}

export const DocumentCardThumbnail = (props: DocumentCardThumbnailProps) => {
  const [loading, setLoading] = useState(true);

  const [url, setUrl] = useState<string | null>();

  const { document } = props;

  const loadManifestThumbnail = (manifestURL: string) => {
    fetch(manifestURL)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        // Look for thumbnail
        if (data.thumbnail) {
          setUrl(data.thumbnail['@id']);
        } else {
          setUrl(undefined);
        }
      });
  };

  if (document.content_type === 'text/plain') {
    return (
      <div className='document-card-image-container'>
        <img src='/img/text-document.png' height={200} width={200} />
      </div>
    );
  } else if (document.content_type == 'application/pdf') {
    return (
      <div className='document-card-image-container'>
        <img src='/img/pdf-document.png' height={200} width={200} />
      </div>
    );
  } else if (document.content_type == 'text/xml') {
    return (
      <div className='document-card-image-container'>
        <img src='/img/tei-document.png' height={200} width={200} />
      </div>
    );
  } else if (document.meta_data?.protocol === 'IIIF_PRESENTATION') {
    if (loading && !url) {
      loadManifestThumbnail(document.meta_data.url);
    }
    return (
      <div className='document-card-image-container'>
        {loading ? (
          <div>
            <Spinner className='search-icon spinner' size={14} />
          </div>
        ) : (
          <img
            src={!loading && url ? url : '/img/iiif-manifest-document.png'}
            height={200}
            width={200}
          />
        )}
      </div>
    );
  } else if (document.content_type?.startsWith('image/')) {
    const url = `${CANTALOUPE_PATH}/${document.id}/square/max/0/default.jpg`;
    return (
      <div className='document-card-image-container'>
        <img src={url} height={200} width={200} />
      </div>
    );
  } else if (document.meta_data?.protocol === 'IIIF_IMAGE') {
    const url = document.meta_data.url.replace(
      '/info.json',
      '/square/max/0/default.jpg'
    );
    return (
      <div className='document-card-image-container'>
        <img src={url} height={200} width={200} />
      </div>
    );
  } else {
    return (
      <div className='document-card-body'>
        <ContentTypeIcon document={document} />
      </div>
    );
  }
};
