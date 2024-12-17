import { Button } from '@components/Button';
import { X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMemo } from 'react';
import type { Document, Translations } from 'src/Types.ts';
import './ViewMetadataModal.css';

interface Props {
  document: Document;

  i18n: Translations;

  onClose(): void;

  open: boolean;
}

export const ViewMetadataModal = (props: Props) => {
  const { t } = props.i18n;

  const metadata = useMemo(() => props.document.meta_data && props.document.meta_data.meta, [props.document]);

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content view-document-metadata'>
          <Dialog.Title className='dialog-title'>
            {t['View Document Metadata']}
          </Dialog.Title>

          {metadata && (
            <div className='metadata-grid'>
              {Object.entries(metadata).map(([key, value]) => (
                <div className='row'>
                  <div className='column'>{t[key]}</div>
                  <div className='column'>{value}</div>
                </div>
              ))}
            </div>
          )}

          {!metadata && (
            <div className='empty'>{t['No document metadata available.']}</div>
          )}

          <div className='actions'>
            <Button onClick={props.onClose}>{t['Close']}</Button>
          </div>

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