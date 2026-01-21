import classNames from 'classnames';
import { type RowComponentProps } from 'react-window';
import type { Column } from '@table-library/react-table-library/compact';
import {
  CheckCircleIcon,
  CheckSquareIcon,
  SquareIcon,
} from '@phosphor-icons/react';
import { DocumentCard } from '@components/DocumentCard';
import type { LibraryDocument } from './DocumentLibrary';
import { CARD_WIDTH, GAP } from './helpers';

interface DocumentListRowProps {
  documents: LibraryDocument[];
  display: 'rows' | 'cards';
  selectedIds: string[];
  disabledIds: string[];
  onSelectChange: (id: string) => void;
  columns: Column<LibraryDocument>[];
  containerWidth: number;
  gridTemplateColumns: string;
}

export const DocumentListRow = ({
  index,
  style,
  ...props
}: RowComponentProps<DocumentListRowProps>) => {
  if (props.display === 'cards') {
    // Grid / "cards" display
    const columnCount =
      Math.floor(props.containerWidth / (CARD_WIDTH + GAP)) || 1;
    const fromIndex = index * columnCount;
    const rowDocs = props.documents.slice(fromIndex, fromIndex + columnCount);

    return (
      <div
        style={{
          ...style,
          gap: GAP,
          gridTemplateColumns: `repeat(${rowDocs.length}, ${CARD_WIDTH}px)`,
        }}
        className='document-grid-row'
      >
        {rowDocs.map((doc) => (
          <div key={doc.id} style={{ width: CARD_WIDTH }}>
            <DocumentCard
              document={doc as LibraryDocument}
              className={classNames({
                selected: props.selectedIds.includes(doc.id),
                disabled: props.disabledIds.includes(doc.id),
              })}
              onClick={() =>
                !props.disabledIds.includes(doc.id) &&
                props.onSelectChange(doc.id)
              }
              readOnly
            />
          </div>
        ))}
      </div>
    );
  }

  // Table / "rows" display

  const doc = props.documents[index];
  if (!doc) return <div style={style}>Loading...</div>;

  const isSelected = props.selectedIds.includes(doc.id);
  const isDisabled = props.disabledIds.includes(doc.id);

  return (
    <div
      style={{ ...style, gridTemplateColumns: props.gridTemplateColumns }}
      className={classNames(
        { selected: isSelected, disabled: isDisabled },
        'document-table-row'
      )}
    >
      <div className='document-table-checkbox'>
        {isDisabled ? (
          <CheckCircleIcon size={22} color='#ccc' />
        ) : isSelected ? (
          <CheckSquareIcon
            className='checkbox-icon'
            size={22}
            fill='#0c529c'
            onClick={() => props.onSelectChange(doc.id)}
          />
        ) : (
          <SquareIcon
            className='checkbox-icon'
            size={22}
            onClick={() => props.onSelectChange(doc.id)}
          />
        )}
      </div>

      {props.columns.map((col, idx) => (
        <div
          key={idx}
          className={classNames(
            { 'revision-dropdown': !col.label },
            'document-table-cell'
          )}
        >
          {col.renderCell(doc)}
        </div>
      ))}
    </div>
  );
};
