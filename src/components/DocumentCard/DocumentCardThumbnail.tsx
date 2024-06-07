import type { Document } from 'src/Types';
import { ContentTypeIcon } from '@components/DocumentCard/ContentTypeIcon';
import './DocumentCardThumbnail.css';
import { IIIFPresentationThumbnail } from './IIIFPresentationThumbnail';
import { IIIFImageThumbnail } from './IIIFImageThumbnail';

export interface DocumentCardThumbnailProps {

  document: Document;

}

export const DocumentCardThumbnail = (props: DocumentCardThumbnailProps) => {

  const { document } = props;

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
    return (
      <IIIFPresentationThumbnail
        manifestURL={document.meta_data.url} />
    );
  } else if (document.content_type?.startsWith('image/') || document.meta_data?.protocol === 'IIIF_IMAGE') {
    return (
      <IIIFImageThumbnail 
        document={document} />
    )
  } else {
    return (
      <div className='document-card-body'>
        <ContentTypeIcon document={document} />
      </div>
    );
  }
};
