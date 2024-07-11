import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Translations, Document, MyProfile, Collection } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import type {
  Column,
  //CompactTable,
} from '@table-library/react-table-library/compact';
import {
  useRowSelect,
  SelectTypes,
  SelectClickTypes,
} from '@table-library/react-table-library/select';
import './DocumentLibrary.css';
import type { TableNode } from '@table-library/react-table-library/types/table';
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import type { Action } from '@table-library/react-table-library/types/common';
import { useSort } from '@table-library/react-table-library/sort';
import { DocumentActions } from './DocumentActions';
import { MetadataModal } from '@components/DocumentCard/MetadataModal';
import { PublicWarningMessage } from './PublicWarningMessage';
import { DocumentTable } from './DocumentTable';
import { CollectionDocumentActions } from './CollectionDocumentActions';
import { CheckCircle } from '@phosphor-icons/react';
import { LoadingOverlay } from '@components/LoadingOverlay';

export type LibraryDocument = Pick<
  Document,
  | 'id'
  | 'name'
  | 'collection_id'
  | 'content_type'
  | 'meta_data'
  | 'collection_metadata'
  | 'created_by'
  | 'created_at'
  | 'is_private'
> & {
  published_date?: string;
  date_number?: number;
  revision_count?: number;
  is_latest?: boolean;
  revisions?: LibraryDocument[];
};

export interface DocumentLibraryProps {
  open: boolean;
  i18n: Translations;
  user: MyProfile;
  disabledIds: string[];
  dataDirty: boolean;
  clearDirtyFlag(): void;
  onCancel(): void;
  UploadActions: React.ReactNode;
  onDocumentsSelected(documentIds: string[]): void;
  onUpdated(document: Document): void;
  onDelete(document: Document): void;
  onTogglePrivate(document: Document): void;
  onError(error: string): void;
  isAdmin: boolean | undefined;
}

const DOCUMENTS_PER_FETCH = 1000;

export const DocumentLibrary = (props: DocumentLibraryProps) => {
  const { t } = props.i18n;
  const { UploadActions } = props;

  const [view, setView] = useState<'mine' | 'all' | 'collection'>('mine');
  const [activeCollection, setActiveCollection] = useState(0);

  const [documents, setDocuments] = useState<LibraryDocument[] | null>(null);
  const [collections, setCollections] = useState<
    { collection: Collection; documents: Document[] }[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [currentDocument, setCurrentDocument] = useState<
    Document | undefined
  >();
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaReadOnly, setMetaReadOnly] = useState(false);
  const [publicToggleDoc, setPublicToggleDoc] = useState<
    Document | undefined
  >();
  const [publicWarningOpen, setPublicWarningOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTogglePrivate = (document: Document) => {
    if (document.is_private) {
      setPublicToggleDoc(document);
      setPublicWarningOpen(true);
    } else {
      props.onTogglePrivate(document);
    }
  };

  const handleWarningCancel = () => {
    setPublicToggleDoc(undefined);
    setPublicWarningOpen(false);
  };

  const handleWarningConfirm = () => {
    if (publicToggleDoc) {
      props.onTogglePrivate(publicToggleDoc);
    }
    setPublicWarningOpen(false);
  };

  const matchesSearch = (document: Document) => {
    return (
      document.name.toLowerCase().includes(search.toLowerCase()) ||
      (document.meta_data?.meta &&
        document.meta_data.meta.author &&
        document.meta_data.meta.author
          .toLowerCase()
          .includes(search.toLowerCase()))
    );
  };

  const themeMine = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  50px 450px repeat(3, minmax(0, 1fr)) 60px !important;
      `,
      HeaderRow: `
        font-size: 13px;
      `,
      Row: `
        font-size: 13px;
        margin-top: 10px;
      `,
    },
  ]);

  const themeAll = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  50px 550px repeat(2, minmax(0, 1fr)) 60px !important;
      `,
      HeaderRow: `
        font-size: 13px;
      `,
      Row: `
        font-size: 13px;
      `,
    },
  ]);

  const themeCollection = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns:  50px 350px 200px repeat(3, minmax(0, 1fr)) 60px !important;
      `,
      HeaderRow: `
        font-size: 13px;
      `,
      Row: `
        font-size: 13px;
      `,
    },
  ]);

  const disabled = (item: LibraryDocument) => {
    let disabled = props.disabledIds.includes(item.id);

    item.revisions?.forEach((n) => {
      if (props.disabledIds.includes(n.id)) {
        disabled = true;
      }
    });

    return disabled;
  };

  useEffect(() => {
    async function getDocuments() {
      setLoading(true);
      const countResp = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });

      if (countResp.error) {
        console.log('Error retrieving document count');
        setLoading(false);
        setDocuments([]);
      } else {
        let docs: LibraryDocument[] = [];

        let start = 0;
        const iterations = Math.ceil(
          (countResp?.count || 0) / DOCUMENTS_PER_FETCH
        );

        console.log(
          `Fetch Iterations: ${iterations}, count: ${countResp?.count}, DOCUMENTS_PER_FETCH: ${DOCUMENTS_PER_FETCH} `
        );

        for (let i = 0; i < iterations; i++) {
          const docsResp = await supabase
            .from('documents')
            .select(
              'id,created_at,created_by,updated_at,updated_by,name,bucket_id,content_type,meta_data, is_private, collection_id, collection_metadata'
            )
            .range(start, start + DOCUMENTS_PER_FETCH - 1);

          if (docsResp.error) {
            console.error(
              'Error retrieving collection documents: ',
              docsResp.error
            );

            setLoading(false);
            setDocuments(docs);
            return;
          }

          docs = [...docs, ...docsResp.data];
          start += DOCUMENTS_PER_FETCH;
        }

        setLoading(false);
        setDocuments(docs);
      }
    }

    if (!documents) {
      getDocuments();
    }
    if (props.dataDirty) {
      getDocuments();
      props.clearDirtyFlag();
    }
  }, [documents, props.dataDirty, props.clearDirtyFlag]);

  useEffect(() => {
    setSelectedIds([]);
  }, [props.disabledIds]);

  useEffect(() => {
    async function getCollections() {
      const resp = await supabase.from('collections').select('id, name');

      if (!resp.error && resp.data) {
        const arr = [];
        for (let i = 0; i < resp.data.length; i++) {
          // Find all members of this collection
          const collectionDocs =
            documents?.filter((d) => d.collection_id === resp.data[i].id) || [];
          const map: { [key: string]: Document[] } = {};

          // collection documents can have multiple versions.  Collect them up
          for (let j = 0; j < collectionDocs.length; j++) {
            const doc = collectionDocs[j];
            if (doc.collection_metadata) {
              if (!map[doc.collection_metadata.document_id]) {
                map[doc.collection_metadata.document_id] = [];
              }

              map[doc.collection_metadata.document_id].push(doc);
            }
          }

          // Sort versions so the highest revision is in front
          const docs = [];
          for (const key in map) {
            map[key].sort((a, b) => {
              if (a.collection_metadata && b.collection_metadata) {
                return (
                  b.collection_metadata.revision_number -
                  a.collection_metadata.revision_number
                );
              }
              return 0;
            });
            const obj: LibraryDocument = {
              ...map[key][0],
              revisions: [],
              revision_count: 0,
            };
            for (let k = 0; k < map[key].length; k++) {
              const date = new Date(map[key][k].created_at as string);
              obj.revisions?.push({
                ...map[key][k],
                date_number: date.getTime(),
                published_date: date.toLocaleDateString(),
              });
            }
            obj.revisions?.sort(
              (a, b) => (b.date_number || 0) - (a.date_number || 0)
            );

            if (obj.revisions && obj.revisions.length > 0) {
              obj.revisions[0].is_latest = true;
              if (obj.id === obj.revisions[0].id) {
                obj.is_latest = true;
              }
            }

            obj.revision_count = obj.revisions ? obj.revisions.length : 0;
            docs.push(obj);
          }
          arr.push({
            collection: resp.data[i],
            documents: docs,
          });
        }
        setCollections(arr);
      }
    }

    if (documents) {
      getCollections();
    }
  }, [documents, props.disabledIds]);

  const columnsMine: Column<TableNode>[] = [
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
    {
      label: t['Private'],
      renderCell: (item) => (item.is_private ? 'TRUE' : 'FALSE'),
      sort: { sortKey: 'PRIVATE' },
    },
    {
      label: '',
      renderCell: (item) => (
        <>
          <DocumentActions
            i18n={props.i18n}
            onDelete={() =>
              currentDocument ? props.onDelete(currentDocument) : {}
            }
            showPrivate={true}
            isPrivate={item.is_private}
            onTogglePrivate={() => handleTogglePrivate(item as Document)}
            isAdmin={item.created_by === props.user.id}
            onEditMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
              setMetaReadOnly(false);
            }}
            onViewMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
              setMetaReadOnly(true);
            }}
          />
        </>
      ),
    },
  ];

  const columnsAll: Column<TableNode>[] = [
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
    {
      label: '',
      renderCell: (item) => (
        <>
          <DocumentActions
            i18n={props.i18n}
            onDelete={() =>
              currentDocument ? props.onDelete(currentDocument) : {}
            }
            isAdmin={item.created_by === props.user.id}
            onEditMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
              setMetaReadOnly(false);
            }}
            onViewMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
              setMetaReadOnly(true);
            }}
          />
        </>
      ),
    },
  ];

  const columnsCollection: Column<TableNode>[] = [
    {
      label: t['Title'],
      renderCell: (item) => item.name,
      select: true,
      pinLeft: true,
      sort: { sortKey: 'TITLE' },
    },
    {
      label: t['Author'],
      renderCell: (item) =>
        item.meta_data.meta?.author ? item.meta_data.meta?.author : '',
      select: true,
      pinLeft: true,
      sort: { sortKey: 'AUTHOR' },
    },

    {
      label: t['Document Type'],
      renderCell: (item) => item.content_type,
      sort: { sortKey: 'TYPE' },
    },
    {
      label: t['Revision Count'],
      renderCell: (item) => item.revisions?.length,
      sort: { sortKey: 'REVISION' },
    },
    {
      label: t['Latest Revision'],
      renderCell: (item) =>
        item.is_latest && props.disabledIds.includes(item.id as string) ? (
          <div style={{ width: '50%', margin: 'auto' }}>
            <CheckCircle size={24} />
          </div>
        ) : disabled(item as LibraryDocument) ? (
          <div style={{ width: '50%', margin: 'auto' }}>
            {item.revisions[0].collection_metadata.revision_number}
          </div>
        ) : (
          <div style={{ width: '50%', margin: 'auto' }}>
            <CheckCircle size={24} color='green' />
          </div>
        ),
    },
    {
      label: '',
      renderCell: (item) => (
        <>
          <CollectionDocumentActions
            i18n={props.i18n}
            disabledIds={props.disabledIds}
            selectedIds={selectedIds}
            onSelectVersion={onSelectChange}
            revisions={item.revisions}
          />
        </>
      ),
    },
  ];

  const myDocuments = documents
    ? documents.filter(
        (d) =>
          d.created_by === props.user.id &&
          !d.collection_id &&
          (search.length > 0 ? matchesSearch(d) : true)
      )
    : [];

  const allDocuments = documents
    ? documents.filter((d) =>
        search.length > 0
          ? matchesSearch(d) && !d.collection_id && !d.is_private
          : !d.collection_id && !d.is_private
      )
    : [];

  const collectionDocuments = activeCollection
    ? collections[activeCollection - 1].documents.filter((d) =>
        search.length > 0 ? matchesSearch(d) : true
      )
    : [];

  const selectAll = useRowSelect(
    { nodes: allDocuments },
    {
      onChange: onSelectChange,
    },
    {
      rowSelect: SelectTypes.MultiSelect,
      clickType: SelectClickTypes.ButtonClick,
    }
  );

  const selectMine = useRowSelect(
    { nodes: myDocuments },
    {
      onChange: onSelectChange,
    },
    {
      rowSelect: SelectTypes.MultiSelect,
      clickType: SelectClickTypes.ButtonClick,
    }
  );

  const selectCollection = useRowSelect(
    {
      nodes: activeCollection
        ? collections[activeCollection - 1].documents
        : [],
    },
    {
      onChange: onSelectChange,
    },
    {
      rowSelect: SelectTypes.MultiSelect,
      clickType: SelectClickTypes.ButtonClick,
    }
  );

  function onSelectChange(action: Action, _state: any) {
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

  const sortMine = useSort(
    { nodes: myDocuments },
    {},
    {
      sortFns: {
        TITLE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        TYPE: (array) =>
          array.sort((a, b) =>
            (a.content_type || '').localeCompare(b.content_type || '')
          ),
        URL: (array) =>
          array.sort((a, b) =>
            (a.meta_data.url || '').localeCompare(b.meta_data.url || '')
          ),
        PRIVATE: (array) => array.sort((a, b) => a.is_private - b.is_private),
      },
    }
  );
  const sortAll = useSort(
    { nodes: allDocuments },
    {},
    {
      sortFns: {
        TITLE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        TYPE: (array) =>
          array.sort((a, b) =>
            (a.content_type || '').localeCompare(b.content_type || '')
          ),
        URL: (array) =>
          array.sort((a, b) =>
            (a.meta_data.url || '').localeCompare(b.meta_data.url || '')
          ),
      },
    }
  );

  const sortCollection = useSort(
    {
      nodes: activeCollection
        ? collections[activeCollection - 1].documents
        : [],
    },
    {},
    {
      sortFns: {
        TITLE: (array) => array.sort((a, b) => a.name.localeCompare(b.name)),
        AUTHOR: (array) =>
          array.sort((a, b) =>
            a.meta_data.meta?.author.localeCompare(b.meta_data.meta?.author)
          ),
        TYPE: (array) =>
          array.sort((a, b) =>
            (a.content_type || '').localeCompare(b.content_type || '')
          ),
        REVISION: (array) =>
          array.sort((a, b) => a.revision_count - b.revision_count),
      },
    }
  );

  const handleSearch = (event: any) => {
    setSearch(event.target.value);
  };

  const handleCancel = () => {
    setSelectedIds([]);
    props.onCancel();
  };

  return (
    <>
      {loading && props.open && <LoadingOverlay />}
      <Dialog.Root open={props.open}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <Dialog.Content className='dialog-content-doc-lib'>
            <Dialog.Title className='dialog-title'>
              {t['Document Library']}
            </Dialog.Title>
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
            <header className='doc-lib-header'>
              <section className='doc-lib-header-bottom'>
                <ul className='doc-lib-header-tabs'>
                  <li
                    className={view === 'all' ? 'active' : undefined}
                    onClick={() => {
                      setView('all');
                      setActiveCollection(0);
                    }}
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
                    onClick={() => {
                      setView('mine');
                      setActiveCollection(0);
                    }}
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
                  {collections &&
                    collections.map((c, idx) => (
                      <li
                        className={
                          view === 'collection' && activeCollection === idx + 1
                            ? 'active'
                            : undefined
                        }
                        onClick={() => {
                          setView('collection');
                          setActiveCollection(idx + 1);
                        }}
                        key={idx}
                      >
                        <button>{c.collection.name}</button>

                        <span
                          className={
                            c.documents.length === 0
                              ? 'badge disabled'
                              : 'badge'
                          }
                        >
                          {c.documents.length}
                        </span>
                      </li>
                    ))}
                </ul>
              </section>
            </header>
            <section className='doc-lib-section-content'>
              {view === 'mine' ? (
                myDocuments.length > 0 ? (
                  <div style={{ height: 300 }}>
                    {/* A little hack to stop the shift key from being captured */}
                    {!currentDocument && (
                      <DocumentTable
                        data={{ nodes: myDocuments }}
                        disabledIds={props.disabledIds}
                        i18n={props.i18n}
                        select={selectMine}
                        theme={themeMine}
                        columns={columnsMine}
                        sort={sortMine}
                      />
                      // <CompactTable
                      //   layout={{ isDiv: true, fixedHeader: true }}
                      //   columns={columnsMine}
                      //   data={{ nodes: myDocuments }}
                      //   virtualizedOptions={VIRTUALIZED_OPTIONS}
                      //   select={selectMine}
                      //   theme={themeMine}
                      //   sort={sortMine}
                      // />
                    )}
                  </div>
                ) : (
                  <div style={{ height: 300 }}>{t['No Documents']}</div>
                )
              ) : view === 'all' ? (
                allDocuments.length > 0 ? (
                  <div style={{ height: 300 }}>
                    <DocumentTable
                      data={{ nodes: allDocuments }}
                      disabledIds={props.disabledIds}
                      i18n={props.i18n}
                      select={selectAll}
                      theme={themeAll}
                      columns={columnsAll}
                      sort={sortAll}
                    />
                    {/* <CompactTable
                    layout={{ isDiv: true, fixedHeader: true }}
                    columns={columnsAll}
                    data={{ nodes: allDocuments }}
                    virtualizedOptions={VIRTUALIZED_OPTIONS}
                    select={selectAll}
                    theme={themeAll}
                    sort={sortAll}
                  /> */}
                  </div>
                ) : (
                  <div style={{ height: 300 }}>{t['No Documents']}</div>
                )
              ) : collections[activeCollection - 1].documents.length > 0 ? (
                <div style={{ height: 300 }}>
                  <DocumentTable
                    data={{
                      nodes: collectionDocuments,
                    }}
                    disabledIds={props.disabledIds}
                    i18n={props.i18n}
                    select={selectCollection}
                    theme={themeCollection}
                    columns={columnsCollection}
                    sort={sortCollection}
                    selectedIds={selectedIds}
                    hasRevisions={true}
                  />
                </div>
              ) : (
                <div style={{ height: 300 }}>{t['No Documents']}</div>
              )}
            </section>
            <div className='doc-lib-buttons'>
              {UploadActions}
              <div>
                <Button type='button' onClick={handleCancel}>
                  {t['Done']}
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
      {currentDocument && (
        <MetadataModal
          open={metaOpen}
          i18n={props.i18n}
          document={currentDocument as Document}
          onClose={() => {
            setMetaOpen(false);
            setCurrentDocument(undefined);
          }}
          onUpdated={props.onUpdated!}
          onError={props.onError!}
          readOnly={metaReadOnly}
        />
      )}
      <PublicWarningMessage
        open={publicWarningOpen}
        message={t['Public Document Warning Message']}
        i18n={props.i18n}
        onCancel={handleWarningCancel}
        onConfirm={handleWarningConfirm}
      />
    </>
  );
};
