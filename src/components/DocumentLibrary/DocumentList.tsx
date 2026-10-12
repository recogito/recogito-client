import { List } from 'react-window';
import { useInfiniteLoader } from 'react-window-infinite-loader';
import type { LibraryDocument } from './DocumentLibrary';
import classNames from 'classnames';
import type { Column } from '@table-library/react-table-library/compact';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import './DocumentList.css';
import { CARD_WIDTH, GAP, getGridTemplate } from './helpers';
import { DocumentListRow } from './DocumentListRow';

const LIST_ROW_HEIGHT = 48;
const GRID_ROW_HEIGHT = 272;

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
  view: 'mine' | 'all' | 'collection';
  sort: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

export const DocumentList = (props: DocumentListProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // track the list's actual width, which depends on the collections sidebar
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    setContainerWidth(el.clientWidth);

    const observer = new ResizeObserver(([entry]) =>
      setContainerWidth(entry.contentRect.width)
    );
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const columnCount =
    props.display === 'cards'
      ? Math.floor(containerWidth / (CARD_WIDTH + GAP)) || 1
      : 1;
  const rowCount =
    Math.ceil(props.documents.length / columnCount) + (props.hasMore ? 1 : 0);
  const rowHeight =
    props.display === 'rows' ? LIST_ROW_HEIGHT : GRID_ROW_HEIGHT;

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
    <div className='document-list' ref={containerRef}>
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
        rowComponent={DocumentListRow}
        rowCount={rowCount}
        rowHeight={rowHeight}
        rowProps={{
          columns: props.columns,
          containerWidth,
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
