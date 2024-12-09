import { DocumentCard } from '@components/DocumentCard';
import { type Select } from '@table-library/react-table-library/select';
import classNames from 'classnames';
import { useCallback } from 'react';
import type { LibraryDocument } from './DocumentLibrary';
import type { Document, Translations } from 'src/Types';
import './DocumentGrid.css';

interface Props {
  disabledIds: string[];

  documents: Document[];

  i18n: Translations;

  select: Select<LibraryDocument>;
}

export const DocumentGrid = (props: Props) => {
  const { onToggleById } = props.select.fns;

  const isDisabled = useCallback((id) => props.disabledIds.includes(id), [props.disabledIds])

  const isSelected = useCallback((id) => {
    const { ids } = props.select.state;
    return ids?.includes(id);
  }, [props.select]);

  const onClick = useCallback((id) => {
    if (isDisabled(id)) {
      return;
    }

    return onToggleById(id);
  }, [isDisabled, onToggleById]);

  return (
    <div className='document-grid'>
      <div className='grid-container'>
        {props.documents.map((document) => (
          <DocumentCard
            className={classNames(
              { 'selected': isSelected(document.id) },
              { 'disabled': isDisabled(document.id) }
            )}
            document={document}
            key={document.id}
            i18n={props.i18n}
            onClick={() => onClick(document.id)}
            readOnly
          />
        ))}
      </div>
    </div>
  );
};
