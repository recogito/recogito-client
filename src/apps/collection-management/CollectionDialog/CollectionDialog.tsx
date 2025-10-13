import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, PencilSimple } from '@phosphor-icons/react';
import './CollectionDialog.css';
import type { Collection, Translations } from 'src/Types';
import { useState } from 'react';

interface CollectionDialogProps {
  collection?: Collection;

  i18n: Translations;

  noTrigger?: boolean;

  onClose?: () => void;

  onSave(name: string): void;

  open?: boolean;
}

export const CollectionDialog = (props: CollectionDialogProps) => {
  const { t } = props.i18n;

  const [collectionName, setName] = useState(props.collection?.name || '');

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      {!props.noTrigger && (
        <Dialog.Trigger asChild>
          <button className='primary'>
            {props.collection ? (
              <>
                <PencilSimple size={20} />
                <span>{t['Edit Collection Name']}</span>
              </>
            ) : (
              <>
                <Plus size={20} />
                <span>{t['Create Collection']}</span>
              </>
            )}
          </button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {props.collection
              ? t['Edit Collection Name']
              : t['Create Collection']}
          </Dialog.Title>
          {!props.collection && (
            <Dialog.Description className='dialog-description'>
              {t['Create a collection of documents.']}
            </Dialog.Description>
          )}
          <fieldset className='collection-dialog-fieldset'>
            <label
              className='collection-dialog-label'
              htmlFor='name'
              aria-label={t['enter collection name']}
            >
              {t['Name']}
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
                  aria-label={t['cancel']}
                >
                  {t['Cancel']}
                </button>
              </Dialog.Close>
            )}
            <Dialog.Close asChild>
              <button
                className='collection-dialog-button primary'
                disabled={collectionName.length === 0}
                onClick={() => props.onSave(collectionName)}
              >
                {props.collection ? t['Save'] : t['Create']}
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className='collection-dialog-icon-button'
              aria-label={t['close']}
            >
              <X size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
