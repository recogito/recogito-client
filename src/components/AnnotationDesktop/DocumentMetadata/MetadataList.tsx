import { isValidURL } from '@util/url';
import { useCallback } from 'react';
import type { DocumentMetadata } from 'src/Types';
import { cleanHTML } from '@util/general';
import './MetadataList.css';

interface Props {
  items: DocumentMetadata[];
}

export const MetadataList = (props: Props) => {
  const renderValue = useCallback((item: any) => {
    if (isValidURL(item.value)) {
      return (
        <a href={item.value} target='_blank' rel='noreferrer'>
          {item.value}
        </a>
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: cleanHTML(item.value) }} />;
  }, []);

  return (
    <ul className='metadata-list text-body-small'>
      {props.items.map((item, index) => (
        <li key={index}>
          <div>{item.label}</div>
          <div>{renderValue(item)}</div>
        </li>
      ))}
    </ul>
  );
};
