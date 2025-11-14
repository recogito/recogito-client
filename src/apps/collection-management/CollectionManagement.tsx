import { useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';
import { CollectionsTable } from './CollectionsTable';
import type { MyProfile, Collection } from 'src/Types';
import { CheckFat, WarningDiamond, ArrowLeft } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import {
  archiveCollection,
  createCollection,
  getInstanceCollections,
  updateCollection,
} from '@backend/crud';
import { CollectionDialog } from './CollectionDialog/CollectionDialog';

import './CollectionManagement.css';

interface CollectionManagementProps {
  collections: Collection[];

  me: MyProfile;
}

const CollectionManagement = (props: CollectionManagementProps) => {
  const { t, i18n } = useTranslation([
    'collection-management',
    'project-home',
    'project-sidebar',
  ]);

  const [collections, setCollections] = useState(props.collections);
  const [filteredCollections, setFilteredCollections] = useState(
    props.collections
  );
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    if (props.collections) {
      setCollections(props.collections);
    }
  }, [props.collections]);

  useEffect(() => {
    if (!search || search.length === 0) {
      setFilteredCollections(collections);
    } else {
      const low = search.toLowerCase();
      setFilteredCollections(
        collections.filter((c) => c.name?.toLowerCase().includes(low))
      );
    }
  }, [search, collections]);

  const handleCreateCollection = (name: string) => {
    createCollection(supabase, name).then(({ error }) => {
      if (error) {
        setToast({
          title: t('Something went wrong', { ns: 'project-home' }),
          description: t('Could not create collection.', {
            ns: 'collection-management',
          }),
          type: 'error',
          icon: <WarningDiamond color='red' />,
        });
        return;
      } else {
        getInstanceCollections(supabase).then(({ error, data }) => {
          if (error) {
            setToast({
              title: t('Something went wrong', { ns: 'project-home' }),
              description: t('Could not retrieve collections.', {
                ns: 'collection-management',
              }),
              type: 'error',
              icon: <WarningDiamond color='red' />,
            });
            return;
          }
          setCollections(data);
          setToast({
            title: t('Success', { ns: 'collection-management' }),
            description: t('Collection has been created.', {
              ns: 'collection-management',
            }),
            type: 'success',
            icon: <CheckFat color='green' />,
          });
        });
      }
    });
  };

  // This actually archives the collection
  const handleDeleteCollection = (collection: Collection) => {
    archiveCollection(supabase, collection.id).then(({ data }) => {
      if (data) {
        setToast({
          title: t('Deleted', { ns: 'project-home' }),
          description: t('Collection deleted successfully.', {
            ns: 'collection-management',
          }),
          type: 'success',
        });
        setCollections((prevCollections) =>
          prevCollections.filter(
            (prevCollection) => prevCollection.id !== collection.id
          )
        );
      } else {
        setToast({
          title: t('Something went wrong', { ns: 'project-home' }),
          description: t('Could not delete the collection.', {
            ns: 'collection-management',
          }),
          type: 'error',
        });
      }
    });
  };

  const handleUpdateCollection = (name: string, collectionId: string) => {
    updateCollection(supabase, { id: collectionId, name }).then(
      ({ error, data }) => {
        if (error) {
          setToast({
            title: t('Something went wrong', { ns: 'project-home' }),
            description: t('Could not update collection.', {
              ns: 'collection-management',
            }),
            type: 'error',
            icon: <WarningDiamond color='red' />,
          });
          return;
        } else {
          setToast({
            title: t('Success', { ns: 'collection-management' }),
            description: t('Collection has been updated.', {
              ns: 'collection-management',
            }),
            type: 'success',
            icon: <CheckFat color='green' />,
          });
          setCollections((prevCollections) =>
            prevCollections.map((prevCollection) =>
              prevCollection.id === collectionId
                ? {
                    ...prevCollection,
                    ...data,
                  }
                : prevCollection
            )
          );
        }
      }
    );
  };

  return (
    <div className='collection-management'>
      <ToastProvider>
        <TopBar onError={(error) => console.log(error)} me={props.me} />
        <div className='collection-management-header'>
          <div>
            <a
              href={`/${i18n.language}/projects`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeft className='text-bottom' size={16} />
              <span>{t('Back to Projects', { ns: 'project-sidebar' })}</span>
            </a>
            <h1>
              {t('Collection Management', { ns: 'collection-management' })}
            </h1>
          </div>
        </div>
        <div className='collection-management-content'>
          <div className='collection-management-actions'>
            <div>
              <label htmlFor='search'>
                {t('Search Collections', { ns: 'collection-management' })}
              </label>
              <input
                autoFocus
                id='search'
                type='text'
                className='collection-management-search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CollectionDialog onSave={handleCreateCollection} />
          </div>

          <div className='collection-management-table'>
            {filteredCollections.length > 0 ? (
              <CollectionsTable
                collections={filteredCollections}
                onDelete={handleDeleteCollection}
                onSave={handleUpdateCollection}
              />
            ) : (
              <p>
                {search
                  ? t('No collections matching search criteria', {
                      ns: 'collection-management',
                    })
                  : t('No collections', { ns: 'collection-management' })}
              </p>
            )}
          </div>
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
        </div>
      </ToastProvider>
    </div>
  );
};

export const CollectionManagementWrapper = (props: CollectionManagementProps) => (
  <I18nextProvider i18n={clientI18next}>
    <CollectionManagement {...props} />
  </I18nextProvider>
);