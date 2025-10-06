import { useEffect, useState } from 'react';
import { CollectionsTable } from './CollectionsTable';
import type { MyProfile, Collection, Translations } from 'src/Types';
import { CheckFat, WarningDiamond, ArrowLeft } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { createCollection, getCollections } from '@backend/crud';
import { CollectionDialog } from './CollectionDialog/CollectionDialog';

import './CollectionManagement.css';

interface CollectionManagementProps {
  i18n: Translations;

  collections: Collection[];

  me: MyProfile;
}

export const CollectionManagement = (props: CollectionManagementProps) => {
  const { lang, t } = props.i18n;

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
        collections.filter((c) =>
          c.name?.toLowerCase().includes(low)
        )
      );
    }
  }, [search, collections]);

  const handleCreateCollection = (name: string) => {
    createCollection(supabase, name).then(({ error }) => {
      if (error) {
        setToast({
          title: t['Something went wrong'],
          description: t['Could not create collection.'],
          type: 'error',
          icon: <WarningDiamond color='red' />,
        });
        return;
      } else {
        getCollections(supabase).then(({ error, data }) => {
          if (error) {
            setToast({
              title: t['Something went wrong'],
              description: t['Could not retrieve collections.'],
              type: 'error',
              icon: <WarningDiamond color='red' />,
            });
            return;
          }
          setCollections(data);
          setToast({
            title: t['Success'],
            description: t['Collection has been created.'],
            type: 'success',
            icon: <CheckFat color='green' />,
          });
        });
      }
    });
  };

  return (
    <div className='collection-management'>
      <ToastProvider>
        <TopBar
          i18n={props.i18n}
          onError={(error) => console.log(error)}
          me={props.me}
        />
        <div className='collection-management-header'>
          <div>
            <a
              href={`/${lang}/projects`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeft className='text-bottom' size={16} />
              <span>{t['Back to Projects']}</span>
            </a>
            <h1>{t['Collection Management']}</h1>
          </div>
        </div>
        <div className='collection-management-content'>
          <div className='collection-management-actions'>
            <div>
              <label htmlFor='search'>{t['Search Collections']}</label>
              <input
                autoFocus
                id='search'
                type='text'
                className='collection-management-search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CollectionDialog
              onSave={handleCreateCollection}
              i18n={props.i18n}
            />
          </div>

          <div className='collection-management-table'>
            {filteredCollections.length > 0 ? (
              <CollectionsTable i18n={props.i18n} collections={filteredCollections} />
            ) : (
              <p>{search ? t['No collections matching search criteria'] : t['No collections']}</p>
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
