import { DocumentTitle } from '@components/MetadataModal/DocumentTitle.tsx';
import { MetadataAttribute } from '@components/MetadataModal/MetadataAttribute.tsx';
import { useCallback, useEffect, useState } from 'react';
import { Check, PencilSimple, Plus, X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateDocumentMetadata } from '@backend/crud';
import { Button } from '@components/Button';
import type { Document, Translations } from 'src/Types';
import './MetadataModal.css';

interface Item {
  label?: string;
  value?: string;
}

interface MetadataModalProps {
  document: Document;

  i18n: Translations;

  open: boolean;

  onClose(): void;

  onUpdated(document: Document): void;

  onError(error: string): void;

  readOnly?: boolean;
}

export const MetadataModal = (props: MetadataModalProps) => {
  const [busy, setBusy] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState<string>('');

  const { t } = props.i18n;

  /**
   * Returns true if the passed index is editable.
   */
  const isEditable = useCallback((index) => editIndex === index, [editIndex]);

  /**
   * Adds a new item to the state and sets the editable index as the new index.
   */
  const onAddItem = useCallback(() => {
    setItems((prevItems) => [...prevItems, { }]);
    setEditIndex(items.length);
  }, [items]);

  /**
   * Removes the item at the passed index and clears the edit index.
   */
  const onRemoveItem = useCallback((index) => {
    setItems((prevItems) => prevItems.filter((i, idx) => index !== idx));
    setEditIndex(null);
  }, []);

  /**
   * Saves the document metadata.
   */
  const onSave = useCallback((e) => {
    e.preventDefault();
    setBusy(true);

    updateDocumentMetadata(supabase, props.document.id, title, {
      ...(props.document.meta_data || {}),
      meta: items,
    }).then(({ error, data }) => {
      setBusy(false);

      if (error) props.onError(error.details);
      else props.onUpdated(data);

      props.onClose();
    });
  }, [items, title, props.document]);

  /**
   * Updates the item at the passed index with the passed attributes.
   */
  const onUpdateItem = useCallback((index, attributes) => {
    const item = Object.assign(items[index], attributes);
    setItems((prevItems) => prevItems.map((i, idx) => idx === index ? item : i));
  }, [items]);

  /**
   * Resets the items, title, and edit index when the modal is opened.
   */
  useEffect(() => {
    if (props.open) {
      setItems(props.document.meta_data?.meta || []);
      setTitle(props.document.name);
      setEditIndex(null);
    }
  }, [props.open, props.document]);

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content metadata-modal'>
          <Dialog.Title className='dialog-title'>
            <DocumentTitle
              onChange={(value) => setTitle(value)}
              readOnly={props.readOnly}
              value={title}
            />
          </Dialog.Title>

          <div className='meta'>
            {!props.readOnly && (
              <Button
                className='primary add-button'
                onClick={onAddItem}
                type='button'
              >
                <Plus />
                {t['Add Metadata']}
              </Button>
            )}
            <table>
              <tbody>
              {(items && items.length > 0) && items.map((item, index) => (
                <tr
                  key={index}
                >
                  <td>
                    <MetadataAttribute
                      autoFocus
                      onChange={(label) => onUpdateItem(index, { label })}
                      readOnly={props.readOnly || !isEditable(index)}
                      value={item.label}
                    />
                  </td>
                  <td>
                    <MetadataAttribute
                      onChange={(value) => onUpdateItem(index, { value })}
                      readOnly={props.readOnly || !isEditable(index)}
                      value={item.value}
                    />
                  </td>
                  {!props.readOnly && (
                    <td className='actions'>
                      {isEditable(index) && (
                        <button
                          className='unstyled icon-only'
                          onClick={() => setEditIndex(null)}
                          type='button'
                        >
                          <Check />
                        </button>
                      )}
                      {!isEditable(index) && (
                        <button
                          className='unstyled icon-only'
                          onClick={() => setEditIndex(index)}
                          type='button'
                        >
                          <PencilSimple />
                        </button>
                      )}
                      <button
                        className='unstyled icon-only'
                        onClick={() => onRemoveItem(index)}
                        type='button'
                      >
                        <X />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {(!items || items.length === 0) && (
                <tr>
                  <td
                    className='empty'
                    colSpan={3}
                  >
                    {t['No document metadata available.']}
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>

          {!props.readOnly && (
            <div className='actions'>
              <Button onClick={props.onClose}>
                <span>{t['Cancel']}</span>
              </Button>

              {!props.readOnly && (
                <Button
                  className='primary'
                  busy={busy}
                  onClick={onSave}
                  type='submit'
                >
                  <span>{t['Save']}</span>
                </Button>
              )}
            </div>
          )}
          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t['Close']}
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
