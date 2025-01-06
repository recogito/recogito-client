import type { DocumentMetadata } from 'src/Types';
import './MetadataList.css';

interface Props {
  items: DocumentMetadata[];
}

export const MetadataList = (props: Props) => {
  return (
    <ul className='metadata-list text-body-small'>
      {props.items.map((item, index) => (
        <li key={index}>
          <span>{item.label}</span>
          <span className='text-body-small-bold'>{item.value}</span>
        </li>
      ))}
    </ul>
  );
};