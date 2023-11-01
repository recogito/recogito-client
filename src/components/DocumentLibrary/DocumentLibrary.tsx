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
import './DocumentLibrary.css';
import type { TableNode } from '@table-library/react-table-library';

export interface DocumentLibraryProps {
  open: boolean;
  i18n: Translations;
  user: MyProfile;
  dataDirty: boolean;
  clearDirtyFlag(): void;
  onAddDocument(document: DocumentInContext): void;
  onCancel(): void;
  UploadActions: React.ReactNode;
}

export const DocumentLibrary = (props: DocumentLibraryProps) => {
  const { t } = props.i18n;
  const { UploadActions } = props;

  const [view, setView] = useState<'mine' | 'all'>('mine');

  const [documents, setDocuments] = useState<Document[] | null>(null);

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
    },
    {
      label: t['Document Type'],
      renderCell: (item) => item.meta_data.protocol,
    },
    {
      label: t['URL'],
      renderCell: (item) => item.meta_data.url,
    },
  ];
  const myDocuments = documents
    ? documents.filter((d) => d.created_by === props.user.id)
    : [];

  const allDocuments = documents || [];

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
              <CompactTable columns={columns} data={{ nodes: myDocuments }} />
            ) : (
              <CompactTable columns={columns} data={{ nodes: allDocuments }} />
            )}
          </section>
          <div className='buttons'>
            {UploadActions}
            <Button type='button' className='sm' onClick={props.onCancel}>
              {t['Cancel']}
            </Button>

            <Button type='submit' className='primary sm'>
              {t['Ok']}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
