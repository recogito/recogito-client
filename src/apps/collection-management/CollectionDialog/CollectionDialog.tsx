import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, PencilSimple } from '@phosphor-icons/react';
import './CollectionDialog.css';
import type { Collection } from 'src/Types';
import { useState } from 'react';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface CollectionDialogProps {
  collection?: Collection;

  noTrigger?: boolean;

  onClose?: () => void;

  onSave(name: string): void;

  open?: boolean;
}

export const CollectionDialog = (props: CollectionDialogProps) => {
  const { t } = useTranslation(['collection-management', 'common', 'a11y']);

  const [collectionName, setName] = useState(props.collection?.name || '');

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      {!props.noTrigger && (
        <Dialog.Trigger asChild>
          <button className='primary'>
            {props.collection ? (
              <>
                <PencilSimple size={20} />
                <span>{t('Edit Collection Name', { ns: 'collection-management' })}</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>{t('Create Collection', { ns: 'collection-management' })}</span>
              </>
            )}
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <DialogContent className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {props.collection
              ? t('Edit Collection Name', { ns: 'collection-management' })
              : t('Create Collection', { ns: 'collection-management' })}
          </Dialog.Title>
          {!props.collection && (
            <Dialog.Description className='dialog-description'>
              {t('Create a collection of documents.', { ns: 'collection-management' })}
            </Dialog.Description>
          )}
          <fieldset className='collection-dialog-fieldset'>
            <label
              className='collection-dialog-label'
              htmlFor='name'
              aria-label={t('enter collection name', { ns: 'collection-management' })}
            >
              {t('Name', { ns: 'common' })}
            </label>
            <input
              className='collection-dialog-input'
              id='name'
              type='text'
              onChange={(e) => setName(e.target.value)}
              value={collectionName}
            />
          </fieldset>
          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            {props.collection && (
              <Dialog.Close asChild>
                <button
                  className='collection-dialog-button'
                  aria-label={t('cancel', { ns: 'collection-management' })}
                >
                  {t('Cancel', { ns: 'common' })}
                </button>
              </Dialog.Close>
            )}
            <Dialog.Close asChild>
              <button
                className='collection-dialog-button primary'
                disabled={collectionName.length === 0}
                onClick={() => props.onSave(collectionName)}
              >
                {props.collection ? t('Save', { ns: 'common' }) : t('Create', { ns: 'common' })}
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className='collection-dialog-icon-button'
              aria-label={t('close', { ns: 'a11y' })}
            >
              <X size={18} />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
