import { List, type RowComponentProps } from 'react-window';
import { useInfiniteLoader } from 'react-window-infinite-loader';
import type { LibraryDocument } from './DocumentLibrary';
import { DocumentCard } from '@components/DocumentCard';
import {
  CheckCircleIcon,
  CheckSquareIcon,
  SquareIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import type { Column } from '@table-library/react-table-library/compact';
import { useMemo } from 'react';
import './DocumentList.css';

const CARD_WIDTH = 200;
const GAP = 16;
const LIST_ROW_HEIGHT = 48;
const GRID_ROW_HEIGHT = 272;

interface RowProps {
  documents: LibraryDocument[];
  display: 'rows' | 'cards';
  selectedIds: string[];
  disabledIds: string[];
  onSelectChange: (id: string) => void;
  columns: Column<LibraryDocument>[];
  containerWidth: number;
  gridTemplateColumns: string;
}

const getGridTemplate = (view: 'mine' | 'all' | 'collection') => {
  // helper function to set the column sizes based on view
  switch (view) {
    case 'mine':
      return '50px 450px 150px 1fr 1fr 60px';
    case 'all':
      return '50px 550px 1fr 1fr 60px';
    case 'collection':
      return '50px 325px 200px 1fr 1fr 60px';
    default:
      return '50px 1fr 1fr 1fr 60px';
  }
};

const Row = ({ index, style, ...props }: RowComponentProps<RowProps>) => {
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

interface DocumentListProps {
  documents: LibraryDocument[];
  display: 'rows' | 'cards';
  selectedIds: string[];
  disabledIds: string[];
  onSelectChange: (id: string) => void;
  columns: Column<LibraryDocument>[];
  hasMore: boolean;
  loadMoreItems: () => Promise<void>;
  isItemLoaded: (index: number) => boolean;
  containerWidth: number;
  view: 'mine' | 'all' | 'collection';
  sort: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

export const DocumentList = (props: DocumentListProps) => {
  const columnCount =
    props.display === 'cards'
      ? Math.floor(props.containerWidth / (CARD_WIDTH + GAP)) || 1
      : 1;
  const rowCount =
    Math.ceil(props.documents.length / columnCount) + (props.hasMore ? 1 : 0);
  const rowHeight = props.display === 'rows' ? LIST_ROW_HEIGHT : GRID_ROW_HEIGHT;

  const gridTemplateColumns = useMemo(
    () => getGridTemplate(props.view),
    [props.view]
  );

  const isRowLoaded = (index: number) => {
    return !props.hasMore || index < rowCount - 1;
  };

  const onRowsRendered = useInfiniteLoader({
    rowCount,
    isRowLoaded,
    loadMoreRows: props.loadMoreItems,
    threshold: 10,
  });

  return (
    <div className='document-list'>
      {props.display === 'rows' && (
        <div className='document-list-header' style={{ gridTemplateColumns }}>
          <div>{/* checkbox */}</div>
          {props.columns.map((col, idx) => {
            const sortKey = col.sort?.sortKey;
            const isActive = props.sort.key === sortKey;
            return (
              <div
                key={`header-${idx}`}
                className={classNames('document-table-cell-header', {
                  'is-sortable': !!sortKey,
                })}
                onClick={() => sortKey && props.onSort(sortKey)}
                style={{
                  cursor: sortKey ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {col.label}
                {sortKey && (
                  <span
                    className={classNames('sort-icon', { active: isActive })}
                  >
                    {isActive && (props.sort.direction === 'asc' ? '↑' : '↓')}
                    {!isActive && <span style={{ opacity: 0.2 }}>↑</span>}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
      <List
        onRowsRendered={onRowsRendered}
        rowComponent={Row}
        rowCount={rowCount}
        rowHeight={rowHeight}
        rowProps={{
          columns: props.columns,
          containerWidth: props.containerWidth,
          disabledIds: props.disabledIds,
          display: props.display,
          documents: props.documents,
          gridTemplateColumns,
          onSelectChange: props.onSelectChange,
          selectedIds: props.selectedIds,
        }}
      />
    </div>
  );
};
