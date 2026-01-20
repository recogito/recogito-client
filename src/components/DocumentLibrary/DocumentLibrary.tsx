import { MetadataModal } from '@components/MetadataModal';
import { SearchInput } from '@components/SearchInput/SearchInput.tsx';
import { ToggleDisplay } from '@components/ToggleDisplay';
import type { ToggleDisplayValue } from '@components/ToggleDisplay';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Document, MyProfile, Collection } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Column } from '@table-library/react-table-library/compact';
import './DocumentLibrary.css';
import { DocumentActions } from './DocumentActions';
import { PublicWarningMessage } from './PublicWarningMessage';
import { CollectionDocumentActions } from './CollectionDocumentActions';
import { CheckCircle, Files, Folder, User } from '@phosphor-icons/react';
import { LoadingOverlay } from '@components/LoadingOverlay';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';
import { DocumentList } from './DocumentList';
import { MissingBadge } from './MissingBadge';

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
  collection_document_id: string;
  revision_number?: number;
  revision_rank?: number;
  is_document_group?: boolean;
  document_group_id?: string;
};

export interface DocumentLibraryProps {
  open: boolean;
  user: MyProfile;
  disabledIds: string[];
  dataDirty: boolean;
  clearDirtyFlag(): void;
  onCancel(): void;
  UploadActions?: React.ReactNode;
  onDocumentsSelected(documentIds: string[]): void;
  onUpdated(document: Document): void;
  onDeleteFromLibrary?(document: Document): void;
  onTogglePrivate(document: Document): void;
  onError(error: string): void;
  isAdmin: boolean | undefined;
  hideCollections?: boolean;
  readOnly?: boolean;
}

export const DOCUMENTS_PER_FETCH = 50;

const SORT_FIELDS: Record<string, string> = {
  TITLE: 'name',
  AUTHOR: 'author',
};

export const DocumentLibrary = (props: DocumentLibraryProps) => {
  const { t } = useTranslation([
    'project-home',
    'common',
    'collection-management',
  ]);
  const { UploadActions } = props;

  const [view, setView] = useState<'mine' | 'all' | 'collection'>('mine');
  const [documentsView, setDocumentsView] =
    useState<ToggleDisplayValue>('rows');
  const [activeCollection, setActiveCollection] = useState(0);

  const [documents, setDocuments] = useState<LibraryDocument[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
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
  const [documentCounts, setDocumentCounts] = useState({
    collections: {} as Record<string, number>,
    myDocs: 0,
    allDocs: 0,
  });
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  // see sortKey in columnsCollection
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'TITLE',
    direction: 'asc',
  });
  const onSort = (key: string) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filterLabel = useMemo(() => {
    let value = '';

    if (view === 'all') {
      value = t('All Documents', { ns: 'project-home' });
    } else if (view === 'mine') {
      value = t('My Documents', { ns: 'project-home' });
    } else if (view === 'collection' && activeCollection > 0) {
      const collection = collections[activeCollection - 1];
      value = collection.name;
    }

    return value;
  }, [activeCollection, collections, view]);

  useEffect(() => {
    const fetchStats = async () => {
      const myDocsCount = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .is('collection_id', null)
        .eq('created_by', props.user.id)
        .eq('is_archived', false);

      const allDocsCount = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .is('collection_id', null)
        .eq('is_private', false)
        .eq('is_archived', false);

      const counts = {
        collections: {} as Record<string, number>,
        myDocs: myDocsCount.count || 0,
        allDocs: allDocsCount.count || 0,
      };

      collections?.forEach((c) => {
        counts.collections[c.id] = c.document_count;
      });

      setDocumentCounts(counts);
    };

    fetchStats();
  }, [collections, props.user.id]);

  const allowEditMetadata = useCallback(
    (item: any) => item.created_by === props.user.id && !props.readOnly,
    [props.user, props.readOnly]
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

  const fetchDocs = useCallback(
    async (viewChanged = false) => {
      if (loading) return;
      setLoading(true);
      const currentPage = viewChanged ? 0 : page;

      const { data, error } = await supabase.rpc('get_library_documents_rpc', {
        _collection_id:
          view === 'collection' ? collections[activeCollection - 1]?.id : null,
        _user_id: props.user.id,
        _is_mine: view === 'mine',
        _search: search,
        _limit: DOCUMENTS_PER_FETCH,
        _offset: currentPage * DOCUMENTS_PER_FETCH,
        _sort_by: SORT_FIELDS[sort.key] || 'name',
        _sort_dir: sort.direction,
      });
      if (!error && data) {
        setDocuments((prev) =>
          viewChanged ? data : [...(prev || []), ...data]
        );
        setHasMore(data.length === DOCUMENTS_PER_FETCH);
        setPage(currentPage + 1);
      } else if (error) {
        // TODO: better error handling
        console.error(error.message);
      }
      setLoading(false);
    },
    [
      view,
      activeCollection,
      search,
      collections,
      props.user.id,
      page,
      loading,
      sort,
    ]
  );

  useEffect(() => {
    // reset on changing view/collection/sort
    setPage(0);
    setDocuments(null);
    setHasMore(true);
    fetchDocs(true);
  }, [view, activeCollection, sort]);

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      setPage(0);
      setDocuments(null);
      setHasMore(true);
      fetchDocs(true);
    }, 400);
    return () => clearTimeout(searchDebounce);
  }, [search]);

  const isItemLoaded = (index: number) => {
    // if we don't have documents yet, nothing is loaded
    if (!documents) return false;

    // last row is the "loading" row when hasMore = true
    return index < documents.length;
  };

  const loadMoreItems = async () => {
    if (loading || !hasMore) return;
    await fetchDocs(false);
  };

  useEffect(() => {
    setSelectedIds([]);
  }, [props.disabledIds]);

  useEffect(() => {
    async function getCollections() {
      const resp = await supabase
        .from('collections')
        .select('id, name, document_count')
        .order('name');

      if (!resp.error && resp.data) {
        setCollections(resp.data);
      }
    }
    getCollections();
  }, []);

  const columnsMine: Column<LibraryDocument>[] = [
    {
      label: t('Title', { ns: 'project-home' }),
      renderCell: (item) =>
        item.name?.trim() || (
          <MissingBadge text={t('No title', { ns: 'project-home' })} />
        ),
      select: true,
      pinLeft: true,
      sort: { sortKey: 'TITLE' },
    },
    {
      label: t('Document Type', { ns: 'common' }),
      renderCell: (item) =>
        item.content_type || (item.meta_data?.url ? 'IIIF' : ''),
    },
    {
      label: t('URL', { ns: 'common' }),
      renderCell: (item) => item.meta_data?.url,
    },
    {
      label: t('Private', { ns: 'common' }),
      renderCell: (item) => (item.is_private ? 'TRUE' : 'FALSE'),
    },
    {
      label: '',
      renderCell: (item) => (
        <>
          <DocumentActions
            allowEditMetadata={!props.readOnly && allowEditMetadata(item)}
            onDelete={() =>
              props.onDeleteFromLibrary
                ? props.onDeleteFromLibrary(item as Document)
                : {}
            }
            showPrivate={!props.readOnly}
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

  const columnsAll: Column<LibraryDocument>[] = [
    {
      label: t('Title', { ns: 'project-home' }),
      renderCell: (item) =>
        item.name?.trim() || (
          <MissingBadge text={t('No title', { ns: 'project-home' })} />
        ),
      select: true,
      pinLeft: true,
      sort: { sortKey: 'TITLE' },
    },
    {
      label: t('Document Type', { ns: 'common' }),
      renderCell: (item) =>
        item.content_type || (item.meta_data?.url ? 'IIIF' : ''),
    },
    {
      label: t('URL', { ns: 'common' }),
      renderCell: (item) => item.meta_data?.url,
    },
    {
      label: '',
      renderCell: (item) => (
        <>
          <DocumentActions
            allowEditMetadata={allowEditMetadata(item)}
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

  const columnsCollection: Column<LibraryDocument>[] = [
    {
      label: t('Title', { ns: 'project-home' }),
      renderCell: (item) => {
        const name = item.name?.trim() || (
          <MissingBadge text={t('No title', { ns: 'project-home' })} />
        );
        return item.document_group_id && item.document_group_id !== '' ? (
          <div style={{ paddingLeft: 15 }}>{name}</div>
        ) : (
          name
        );
      },
      select: true,
      pinLeft: true,
      sort: { sortKey: 'TITLE' },
    },
    {
      label: t('Author/Artist', { ns: 'project-home' }),
      renderCell: (item) => {
        const author =
          item.meta_data?.meta && Array.isArray(item.meta_data.meta)
            ? item.meta_data.meta.find(
                (m: any) => m.label === 'Author' || m.label === 'Artist'
              )
            : null;
        return author?.value.trim() ? (
          author.value.trim()
        ) : (
          <MissingBadge text={t('No author/artist', { ns: 'project-home' })} />
        );
      },

      select: true,
      pinLeft: true,
      sort: { sortKey: 'AUTHOR' },
    },
    {
      label: t('Document Type', { ns: 'common' }),
      renderCell: (item) =>
        item.content_type || (item.meta_data?.url ? 'IIIF' : ''),
    },
    {
      label: t('Latest Revision', { ns: 'common' }),
      renderCell: (item) =>
        props.disabledIds.includes(item.id as string) ? (
          <div className='revision-cell'>
            <CheckCircle size={24} />
          </div>
        ) : (
          <div className='revision-cell'>
            <CheckCircle size={24} color='green' />
          </div>
        ),
    },
    {
      // metadata/revisions dropdown
      label: '',
      renderCell: (item) => (
        <>
          {!item.is_document_group && (
            <CollectionDocumentActions
              disabledIds={props.disabledIds}
              selectedIds={selectedIds}
              onOpenMetadata={() => {
                setCurrentDocument(item as Document);
                setMetaOpen(true);
              }}
              onSelectVersion={onSelectChange}
              document={item}
            />
          )}
        </>
      ),
    },
  ];

  const listColumns = useMemo(() => {
    if (view === 'mine') {
      return columnsMine;
    } else if (view === 'all') {
      return columnsAll;
    }
    return columnsCollection;
  }, [view, columnsMine, columnsAll, columnsCollection]);

  function onSelectChange(id: string) {
    if (documents) {
      const type = selectedIds.includes(id) ? 'REMOVE_BY_ID' : 'ADD_BY_ID';
      // Handle any selected group documents
      let newIds: string[] = [];
      const doc = documents.find((d) => d.id === id);

      if (doc) {
        if (!doc.is_document_group) {
          newIds.push(id);
          if (type === 'REMOVE_BY_ID' && doc.document_group_id) {
            if (selectedIds.includes(doc.document_group_id)) {
              newIds.push(doc.document_group_id);
            }
          } else if (type === 'ADD_BY_ID' && doc.document_group_id) {
            const groupDocIds = documents
              .filter((d) => d.document_group_id === doc.document_group_id)
              .map((d) => d.id);

            if (
              groupDocIds.every((v) => [...selectedIds, doc.id].includes(v))
            ) {
              newIds.push(doc.document_group_id);
            }
          }
        } else {
          const groupDocs = documents?.filter(
            (d) => d.document_group_id === id
          );
          newIds = [...newIds, ...groupDocs.map((d) => d.id), id];
        }
      }
      if (type === 'ADD_BY_ID') {
        const ids = [...selectedIds, ...newIds];
        setSelectedIds(ids);
      } else if (type === 'REMOVE_BY_ID') {
        const ids = selectedIds.filter((i) => !newIds.includes(i));
        setSelectedIds(ids);
      }
    }
  }

  const handleCancel = () => {
    setSelectedIds([]);
    props.onCancel();
  };

  const handleSubmit = () => {
    // Filter out any document groups
    const ids: string[] = [];
    selectedIds.forEach((id) => {
      const doc = documents?.find((d) => d.id === id);
      if (!doc?.is_document_group) {
        ids.push(id);
      }
    });
    props.onDocumentsSelected(ids);
  };

  return (
    <>
      {loading && props.open && <LoadingOverlay />}
      <Dialog.Root open={props.open}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />
          <DialogContent className='dialog-content-doc-lib'>
            <section className='doc-lib-title'>
              <Dialog.Title className='dialog-title'>
                {t('Add Document', { ns: 'project-home' })}
              </Dialog.Title>

              <Dialog.Description className='text-body-small'>
                {t('Select a document or upload a new one.', {
                  ns: 'project-home',
                })}
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
                      <span className='name'>
                        {t('All Documents', { ns: 'project-home' })}
                      </span>
                      <span
                        className={
                          documentCounts.allDocs === 0
                            ? 'badge disabled'
                            : 'badge'
                        }
                      >
                        {documentCounts.allDocs}
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
                      <span className='name'>
                        {t('My Documents', { ns: 'project-home' })}
                      </span>
                      <span
                        className={
                          documentCounts.myDocs === 0
                            ? 'badge disabled'
                            : 'badge'
                        }
                      >
                        {documentCounts.myDocs}
                      </span>
                    </li>
                  </ul>
                </section>

                {collections && !props.hideCollections && (
                  <section className='doc-lib-header-bottom collections'>
                    <h3>{t('Collections', { ns: 'common' })}</h3>

                    <ul className='doc-lib-header-tabs'>
                      {collections.map((c, idx) => {
                        const count = documentCounts.collections[c.id] || 0;
                        return (
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
                            key={c.id}
                          >
                            <Folder />
                            <span className='name'>{c.name}</span>
                            <span
                              className={
                                count === 0 ? 'badge disabled' : 'badge'
                              }
                            >
                              {count}
                            </span>
                          </li>
                        );
                      })}
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
                      placeholder={t('Search', { ns: 'common' })}
                      search={search}
                    />

                    <ToggleDisplay
                      display={documentsView}
                      onChangeDisplay={(value) => setDocumentsView(value)}
                    />

                    {UploadActions}
                  </div>
                </div>

                <div style={{ height: 450 }}>
                  {documents && (
                    <DocumentList
                      documents={documents}
                      display={documentsView}
                      selectedIds={selectedIds}
                      disabledIds={props.disabledIds}
                      onSelectChange={onSelectChange}
                      columns={listColumns}
                      hasMore={hasMore}
                      loadMoreItems={loadMoreItems}
                      isItemLoaded={isItemLoaded}
                      containerWidth={900}
                      view={view}
                      onSort={onSort}
                      sort={sort}
                    />
                  )}
                </div>
              </section>
            </div>

            <div className='doc-lib-footer'>
              <div>
                <Button type='button' onClick={handleCancel}>
                  {t('Cancel', { ns: 'common' })}
                </Button>
                <Button
                  type='submit'
                  className='primary'
                  disabled={selectedIds.length === 0}
                  onClick={() => handleSubmit()}
                >
                  {t('Add Selected', { ns: 'project-home' })}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog.Portal>
      </Dialog.Root>

      {currentDocument && (
        <MetadataModal
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
        message={t('Public Document Warning Message', { ns: 'project-home' })}
        onCancel={handleWarningCancel}
        onConfirm={handleWarningConfirm}
      />
    </>
  );
};
