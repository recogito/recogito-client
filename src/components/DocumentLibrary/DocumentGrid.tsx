import { DocumentCard } from '@components/DocumentCard';
import classNames from 'classnames';
import { useCallback } from 'react';
import type { LibraryDocument } from './DocumentLibrary';
import type { Document } from 'src/Types';
import './DocumentGrid.css';

interface Props {
  disabledIds: string[];

  documents: LibraryDocument[];

  selectedIds: string[];

  onSelectChange(id: string): void;
}

export const DocumentGrid = (props: Props) => {
  const isDisabled = useCallback(
    (id: string) => props.disabledIds.includes(id),
    [props.disabledIds]
  );

  const isSelected = useCallback(
    (id: string) => {
      return props.selectedIds?.includes(id);
    },
    [props.selectedIds]
  );

  const onClick = useCallback(
    (id: string) => {
      if (isDisabled(id)) {
        return;
      }

      return props.onSelectChange(id);
    },
    [isDisabled]
  );

  return (
    <div className='document-grid'>
      <div className='grid-container'>
        {props.documents.map((document) => (
          // @ts-ignore
          <DocumentCard
            className={classNames(
              { selected: isSelected(document.id) },
              { disabled: isDisabled(document.id) }
            )}
            document={document as Document}
            key={document.id}
            onClick={() => onClick(document.id)}
            readOnly
          />
        ))}
      </div>
    </div>
  );
};
