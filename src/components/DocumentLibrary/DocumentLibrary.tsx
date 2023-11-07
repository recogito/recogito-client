import React, { useState, FC, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type {
  DocumentInContext,
  Translations,
  Document,
  MyProfile,
} from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import {
  Column,
  CompactTable,
} from '@table-library/react-table-library/compact';
import {
  useRowSelect,
  SelectTypes,
} from '@table-library/react-table-library/select';
import './DocumentLibrary.css';
import type { TableNode } from '@table-library/react-table-library';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import type {
  Action,
  MiddlewareFunction,
} from '@table-library/react-table-library/types/common';
import { useSort } from '@table-library/react-table-library/sort';

export interface DocumentLibraryProps {
  open: boolean;
  i18n: Translations;
  user: MyProfile;
  disabledIds: string[];
  dataDirty: boolean;
  clearDirtyFlag(): void;
  onAddDocument(document: DocumentInContext): void;
  onCancel(): void;
  UploadActions: React.ReactNode;
  onDocumentsSelected(documentIds: string[]): void;
}

export const DocumentLibrary = (props: DocumentLibraryProps) => {
  const { t } = props.i18n;
  const { UploadActions } = props;

  const [view, setView] = useState<'mine' | 'all'>('mine');

  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  44px repeat(3, minmax(0, 1fr)) !important;
      `,
      HeaderRow: `
        font-size: 13px;
      `,
      Row: `
        font-size: 13px;
      `,
    },
  ]);

  useEffect(() => {
    async function getDocuments() {
      const resp = await supabase
        .from('documents')
        .select(
          'id,created_at,created_by,updated_at,updated_by,name,bucket_id,content_type,meta_data'
        );

      setDocuments(resp.data);
    }

    if (!documents) {
      getDocuments();
    }
    if (props.dataDirty) {
      getDocuments();
      props.clearDirtyFlag();
    }
  }, [documents, props.dataDirty, props.clearDirtyFlag]);

  const columns: Column<TableNode>[] = [
    {
      label: t['Title'],
      renderCell: (item) => item.name,
      select: true,
      pinLeft: true,
      sort: { sortKey: 'TITLE' },
    },
    {
      label: t['Document Type'],
      renderCell: (item) => item.content_type,
      sort: { sortKey: 'TYPE' },
    },
    {
      label: t['URL'],
      renderCell: (item) => item.meta_data.url,
      sort: { sortKey: 'URL' },
    },
  ];
  const myDocuments = documents
    ? documents.filter(
        (d) =>
          d.created_by === props.user.id &&
          (search.length > 0
            ? d.name.toLowerCase().includes(search.toLowerCase())
            : true) &&
          !props.disabledIds.includes(d.id)
      )
    : [];

  const allDocuments = documents
    ? documents.filter(
        (d) =>
          (search.length > 0
            ? d.name.toLowerCase().includes(search.toLowerCase())
            : true) && !props.disabledIds.includes(d.id)
      )
    : [];

  const selectAll = useRowSelect(
    { nodes: allDocuments },
    {
      onChange: onSelectChange,
    },
    {
      rowSelect: SelectTypes.MultiSelect,
    }
  );

  const selectMine = useRowSelect(
    { nodes: myDocuments },
    {
      onChange: onSelectChange,
    },
    {
      rowSelect: SelectTypes.MultiSelect,
    }
  );

  function onSelectChange(action: Action, state: any) {
    if (action.type === 'ADD_BY_IDS') {
      const ids = [...selectedIds, ...action.payload.ids];
      setSelectedIds(ids);
    } else if (action.type === 'SET') {
      setSelectedIds(action.payload.ids);
    } else if (action.type === 'REMOVE_BY_IDS') {
      const ids = [...selectedIds.filter((i) => i !== action.payload.ids[0])];
      setSelectedIds(ids);
    }
  }

  const VIRTUALIZED_OPTIONS = {
    rowHeight: (_item: any, _index: any) => 33,
  };

  const sortMine = useSort(
    { nodes: myDocuments },
    {},
    {
      sortFns: {
        TITLE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        TYPE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        URL: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
      },
    }
  );
  const sortAll = useSort(
    { nodes: myDocuments },
    {},
    {
      sortFns: {
        TITLE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        TYPE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        URL: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
      },
    }
  );

  const handleSearch = (event: any) => {
    setSearch(event.target.value);
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content-doc-lib'>
          <Dialog.Title className='dialog-title'>
            {t['Document Library']}
          </Dialog.Title>
          <Dialog.Description className='dialog-description'>
            <div className='doc-lib-buttons'>
              {t['Select a document or upload a new one.']}
              <label htmlFor='search'>
                {t['Search']}
                <input
                  id='search'
                  type='text'
                  className='doc-lib-search'
                  value={search}
                  onChange={handleSearch}
                />
              </label>
            </div>
          </Dialog.Description>
          <header className='doc-lib-header'>
            <section className='doc-lib-header-bottom'>
              <ul className='doc-lib-header-tabs'>
                <li
                  className={view === 'all' ? 'active' : undefined}
                  onClick={() => setView('all')}
                >
                  <button>{t['All Documents']}</button>

                  <span
                    className={
                      allDocuments.length === 0 ? 'badge disabled' : 'badge'
                    }
                  >
                    {allDocuments.length}
                  </span>
                </li>
                <li
                  className={view === 'mine' ? 'active' : undefined}
                  onClick={() => setView('mine')}
                >
                  <button>{t['My Documents']}</button>

                  <span
                    className={
                      myDocuments.length === 0 ? 'badge disabled' : 'badge'
                    }
                  >
                    {myDocuments.length}
                  </span>
                </li>
              </ul>
            </section>
          </header>
          <section className='doc-lib-section-content'>
            {view === 'mine' ? (
              myDocuments.length > 0 ? (
                <div style={{ height: 300 }}>
                  <CompactTable
                    layout={{ isDiv: true, fixedHeader: true }}
                    columns={columns}
                    data={{ nodes: myDocuments }}
                    virtualizedOptions={VIRTUALIZED_OPTIONS}
                    select={selectMine}
                    theme={theme}
                    sort={sortMine}
                  />
                </div>
              ) : (
                <div style={{ height: 300 }}>{t['No Documents']}</div>
              )
            ) : allDocuments.length > 0 ? (
              <div style={{ height: 300 }}>
                <CompactTable
                  layout={{ isDiv: true, fixedHeader: true }}
                  columns={columns}
                  data={{ nodes: allDocuments }}
                  virtualizedOptions={VIRTUALIZED_OPTIONS}
                  select={selectAll}
                  theme={theme}
                  sort={sortAll}
                />
              </div>
            ) : (
              <div style={{ height: 300 }}>{t['No Documents']}</div>
            )}
          </section>
          <div className='doc-lib-buttons'>
            {UploadActions}
            <div>
              <Button type='button' onClick={props.onCancel}>
                {t['Cancel']}
              </Button>
              <Button
                type='submit'
                className='primary'
                disabled={selectedIds.length === 0}
                onClick={() => props.onDocumentsSelected(selectedIds)}
              >
                {t['Add Selected Documents']}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
