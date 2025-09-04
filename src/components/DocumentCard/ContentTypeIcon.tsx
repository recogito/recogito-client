import { Code, FilePdf, TextAlignLeft } from '@phosphor-icons/react';
import type { Document } from 'src/Types';

interface ContentTypeIconProps {
  document: Document;
}

export const ContentTypeIcon = (props: ContentTypeIconProps) => {
  const { content_type, meta_data } = props.document;

  if (content_type === 'text/plain') {
    return (
      <TextAlignLeft
        size={44}
        weight='thin'
        alt={`text document ${props.document.name}`}
      />
    );
  } else if (content_type === 'text/xml') {
    return (
      <Code
        size={44}
        weight='thin'
        alt={`x m l document ${props.document.name}`}
      />
    );
  } else if (content_type === 'application/pdf') {
    return (
      <FilePdf
        size={44}
        weight='thin'
        alt={`p d f document ${props.document.name}`}
      />
    );
  } else if (content_type?.startsWith('image/')) {
    return (
      <img
        src='/img/iiif-logo.png'
        alt={`image ${props.document.name}`}
        style={{ width: 52, height: 45 }}
      />
    );
  } else if (
    meta_data?.protocol === 'IIIF_IMAGE' ||
    meta_data?.protocol === 'IIIF_PRESENTATION'
  ) {
    return (
      <img
        src='/img/iiif-logo.png'
        alt={`i i i f document ${props.document.name}`}
        style={{ width: 52, height: 45 }}
      />
    );
  } else {
    return null;
  }
};
