import { DocumentGrid } from '@components/DocumentLibrary/DocumentGrid.tsx';
import { MetadataModal } from '@components/MetadataModal';
import { SearchInput } from '@components/SearchInput/SearchInput.tsx';
import { ToggleDisplay } from '@components/ToggleDisplay';
import type { ToggleDisplayValue } from '@components/ToggleDisplay';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Translations, Document, MyProfile, Collection } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Column } from '@table-library/react-table-library/compact';
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
import { PublicWarningMessage } from './PublicWarningMessage';
import { DocumentTable } from './DocumentTable';
import { CollectionDocumentActions } from './CollectionDocumentActions';
import { CheckCircle, Files, Folder, User } from '@phosphor-icons/react';
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
  onDeleteFromLibrary?(document: Document): void;
  onTogglePrivate(document: Document): void;
  onError(error: string): void;
  isAdmin: boolean | undefined;
}

const DOCUMENTS_PER_FETCH = 1000;

export const DocumentLibrary = (props: DocumentLibraryProps) => {
  const { t } = props.i18n;
  const { UploadActions } = props;

  const [view, setView] = useState<'mine' | 'all' | 'collection'>('mine');
  const [documentsView, setDocumentsView] =
    useState<ToggleDisplayValue>('rows');
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
  const [publicToggleDoc, setPublicToggleDoc] = useState<
    Document | undefined
  >();
  const [publicWarningOpen, setPublicWarningOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const filterLabel = useMemo(() => {
    let value = '';

    if (view === 'all') {
      value = t['All Documents'];
    } else if (view === 'mine') {
      value = t['My Documents'];
    } else if (view === 'collection' && activeCollection > 0) {
      const { collection } = collections[activeCollection - 1];
      value = collection.name;
    }

    return value;
  }, [activeCollection, collections, view]);

  const allowEditMetadata = useCallback(
    (item: any) => item.created_by === props.user.id,
    [props.user]
  );

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
    const author =
      document.meta_data?.meta && Array.isArray(document.meta_data.meta)
        ? document.meta_data.meta.find(
            (m) => m.label === 'Author' || m.label === 'Artist'
          )
        : null;
    return (
      document.name.toLowerCase().includes(search.toLowerCase()) ||
      (author && author.value.toLowerCase().includes(search.toLowerCase()))
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
        for (let i = 0; i < iterations; i++) {
          const docsResp = await supabase
            .from('documents')
            .select(
              'id,created_at,created_by,updated_at,updated_by,name,bucket_id,content_type,meta_data, is_private, collection_id, collection_metadata'
            )
            .range(start, start + DOCUMENTS_PER_FETCH - 1);

          if (docsResp.error) {
            console.error('Error retrieving documents: ', docsResp.error);

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
            allowEditMetadata={allowEditMetadata(item)}
            i18n={props.i18n}
            onDelete={() =>
              props.onDeleteFromLibrary
                ? props.onDeleteFromLibrary(item as Document)
                : {}
            }
            showPrivate={true}
            isPrivate={item.is_private}
            onOpenMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
            }}
            onTogglePrivate={() => handleTogglePrivate(item as Document)}
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
            allowEditMetadata={allowEditMetadata(item)}
            i18n={props.i18n}
            onDelete={() =>
              currentDocument && props.onDeleteFromLibrary
                ? props.onDeleteFromLibrary(currentDocument)
                : {}
            }
            onOpenMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
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
      label: t['Author/Artist'],
      renderCell: (item) => {
        const author =
          item.meta_data.meta && Array.isArray(item.meta_data.meta)
            ? item.meta_data.meta.find(
                (m: any) => m.label === 'Author' || m.label === 'Artist'
              )
            : null;
        return author ? author.value : '';
      },

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
            onOpenMetadata={() => {
              setCurrentDocument(item as Document);
              setMetaOpen(true);
            }}
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
      const ids = selectedIds.filter((i) => i !== action.payload.ids[0]);
      setSelectedIds(ids);
    } else if (action.type === 'ADD_BY_ID') {
      const ids = [...selectedIds, action.payload.id];
      setSelectedIds(ids);
    } else if (action.type === 'REMOVE_BY_ID') {
      const ids = selectedIds.filter((i) => i !== action.payload.id);
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
          array.sort((a, b) => {
            const aAuthorFind =
              a.meta_data.meta && Array.isArray(a.meta_data.meta)
                ? a.meta_data.meta.find(
                    (m: any) => m.label === 'Author' || m.label === 'Artist'
                  )
                : null;
            const aAuthor = aAuthorFind ? aAuthorFind.value : '';
            const bAuthorFind =
              b.meta_data.meta && Array.isArray(b.meta_data.meta)
                ? b.meta_data.meta.find(
                    (m: any) => m.label === 'Author' || m.label === 'Artist'
                  )
                : null;
            const bAuthor = bAuthorFind ? bAuthorFind.value : '';

            return aAuthor.localeCompare(bAuthor);
          }),
        TYPE: (array) =>
          array.sort((a, b) =>
            (a.content_type || '').localeCompare(b.content_type || '')
          ),
        REVISION: (array) =>
          array.sort((a, b) => a.revision_count - b.revision_count),
      },
    }
  );

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
            <section className='doc-lib-title'>
              <Dialog.Title className='dialog-title'>
                {t['Add Document']}
              </Dialog.Title>

              <Dialog.Description className='text-body-small'>
                {t['Select a document or upload a new one.']}
              </Dialog.Description>
            </section>
            <div className='doc-lib-content'>
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
                      <Files />
                      {t['All Documents']}
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
                      <User />
                      {t['My Documents']}
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

                {collections && (
                  <section className='doc-lib-header-bottom collections'>
                    <h3>{t['Collections']}</h3>

                    <ul className='doc-lib-header-tabs'>
                      {collections.map((c, idx) => (
                        <li
                          className={
                            view === 'collection' &&
                            activeCollection === idx + 1
                              ? 'active'
                              : undefined
                          }
                          onClick={() => {
                            setView('collection');
                            setActiveCollection(idx + 1);
                          }}
                          key={idx}
                        >
                          <Folder />
                          {c.collection.name}
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
                )}
              </header>

              <section className='doc-lib-section-content'>
                <div className='doc-lib-section-content-header'>
                  <h3>{filterLabel}</h3>

                  <div className='doc-lib-buttons'>
                    <SearchInput
                      className='doc-lib-search'
                      onChange={({ target: { value } }) => setSearch(value)}
                      onClear={() => setSearch('')}
                      placeholder={t['Search']}
                      search={search}
                    />

                    <ToggleDisplay
                      display={documentsView}
                      onChangeDisplay={(value) => setDocumentsView(value)}
                      i18n={props.i18n}
                    />

                    {UploadActions}
                  </div>
                </div>

                <div style={{ height: 450 }}>
                  {/* My Documents */}
                  {view === 'mine' &&
                    myDocuments.length > 0 &&
                    documentsView === 'rows' && (
                      <DocumentTable
                        data={{ nodes: myDocuments }}
                        disabledIds={props.disabledIds}
                        i18n={props.i18n}
                        select={selectMine}
                        theme={themeMine}
                        columns={columnsMine}
                        sort={sortMine}
                      />
                    )}
                  {view === 'mine' &&
                    myDocuments.length > 0 &&
                    documentsView === 'cards' && (
                      <DocumentGrid
                        disabledIds={props.disabledIds}
                        documents={myDocuments}
                        i18n={props.i18n}
                        select={selectMine}
                      />
                    )}
                  {view === 'mine' &&
                    myDocuments.length === 0 &&
                    t['No Documents']}

                  {/* All Documents */}
                  {view === 'all' &&
                    allDocuments.length > 0 &&
                    documentsView === 'rows' && (
                      <DocumentTable
                        data={{ nodes: allDocuments }}
                        disabledIds={props.disabledIds}
                        i18n={props.i18n}
                        select={selectAll}
                        theme={themeAll}
                        columns={columnsAll}
                        sort={sortAll}
                      />
                    )}
                  {view === 'all' &&
                    allDocuments.length > 0 &&
                    documentsView === 'cards' && (
                      <DocumentGrid
                        disabledIds={props.disabledIds}
                        documents={allDocuments}
                        i18n={props.i18n}
                        select={selectAll}
                      />
                    )}
                  {view === 'all' &&
                    allDocuments.length === 0 &&
                    t['No Documents']}

                  {/* Collection Documents */}
                  {view === 'collection' &&
                    collectionDocuments.length > 0 &&
                    documentsView === 'rows' && (
                      <DocumentTable
                        data={{ nodes: collectionDocuments }}
                        disabledIds={props.disabledIds}
                        i18n={props.i18n}
                        select={selectCollection}
                        theme={themeCollection}
                        columns={columnsCollection}
                        sort={sortCollection}
                      />
                    )}
                  {view === 'collection' &&
                    collectionDocuments.length > 0 &&
                    documentsView === 'cards' && (
                      <DocumentGrid
                        disabledIds={props.disabledIds}
                        documents={collectionDocuments}
                        i18n={props.i18n}
                        select={selectCollection}
                      />
                    )}
                  {view === 'collection' &&
                    collectionDocuments.length === 0 &&
                    t['No Documents']}
                </div>
              </section>
            </div>

            <div className='doc-lib-footer'>
              <div>
                <Button type='button' onClick={handleCancel}>
                  {t['Cancel']}
                </Button>
                <Button
                  type='submit'
                  className='primary'
                  disabled={selectedIds.length === 0}
                  onClick={() => props.onDocumentsSelected(selectedIds)}
                >
                  {t['Add Selected']}
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {currentDocument && (
        <MetadataModal
          i18n={props.i18n}
          document={currentDocument}
          open={metaOpen}
          onClose={() => {
            setMetaOpen(false);
            setCurrentDocument(undefined);
          }}
          onUpdated={props.onUpdated!}
          onError={props.onError!}
          readOnly={!allowEditMetadata(currentDocument)}
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
