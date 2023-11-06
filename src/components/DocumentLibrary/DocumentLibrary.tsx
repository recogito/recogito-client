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
  CompactTable,
  Column,
} from '@table-library/react-table-library/compact';
import { useRowSelect } from '@table-library/react-table-library/select';
import './DocumentLibrary.css';
import type { TableNode } from '@table-library/react-table-library';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import type {
  Action,
  MiddlewareFunction,
} from '@table-library/react-table-library/types/common';

export interface DocumentLibraryProps {
  open: boolean;
  i18n: Translations;
  user: MyProfile;
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

  const theme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  44px repeat(3, minmax(0, 1fr));
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
    },
    {
      label: t['Document Type'],
      renderCell: (item) => item.content_type,
    },
    {
      label: t['URL'],
      renderCell: (item) => item.meta_data.url,
    },
  ];
  const myDocuments = documents
    ? documents.filter((d) => d.created_by === props.user.id)
    : [];

  const allDocuments = documents ? documents : [];

  const selectAll = useRowSelect(
    { nodes: allDocuments },
    {
      onChange: onSelectChange,
    }
  );

  const selectMine = useRowSelect(
    { nodes: myDocuments },
    {
      onChange: onSelectChange,
    }
  );

  function onSelectChange(action: Action, state: any) {
    if (action.type === 'ADD_BY_IDS') {
      setSelectedIds([...selectedIds, ...action.payload.ids]);
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== action.payload.ids[0]));
    }
  }

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content-doc-lib'>
          <Dialog.Title className='dialog-title'>
            {t['Document Library']}
          </Dialog.Title>
          <Dialog.Description className='dialog-description'>
            {t['Select a document or upload a new one.']}
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
                <CompactTable
                  columns={columns}
                  data={{ nodes: myDocuments }}
                  select={selectMine}
                  theme={theme}
                  layout={{ custom: true }}
                />
              ) : (
                'No Documents'
              )
            ) : allDocuments.length > 0 ? (
              <CompactTable
                columns={columns}
                data={{ nodes: allDocuments }}
                select={selectAll}
                theme={theme}
                layout={{ custom: true }}
              />
            ) : (
              'No Documents'
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
