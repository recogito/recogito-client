import { useState } from "react";
import type { Document } from "src/Types";
import { ContentTypeIcon } from '@components/DocumentCard/ContentTypeIcon';
import './DocumentCardThumbnail.css';

export interface DocumentCardThumbnailProps {
  document: Document;
}

export const DocumentCardThumbnail = (props: DocumentCardThumbnailProps) => {

  const [loading, setLoading] = useState(true);

  const { document } = props;

  if (document.meta_data?.protocol === 'IIIF_IMAGE') {
    const url = document.meta_data.url.replace("/info.json", "/square/max/0/default.jpg")
    return (
      <div className="document-card-image-container">
        <img src={url} height={200} width={200} />
      </div>
    )
  } else {
    return (
      <div className='document-card-body'>
        <ContentTypeIcon document={document} />
      </div>
    )
  }
}