import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';
import { X } from '@phosphor-icons/react';

export interface UrlDialogProps {
  open: boolean;
  title: string;
  message: string;
  onSave(url: string): void;
  onClose(): void;
  i18n: Translations;
}

export const UrlDialog = (props: UrlDialogProps) => {
  const [value, setValue] = useState('');
  const { t } = props.i18n;

  const handleSave = () => {
    props.onSave(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>
          <Dialog.Description className='dialog-description'>
            {props.message}
          </Dialog.Description>
          <fieldset className='rte-fieldset'>
            <label className='Label' htmlFor='name'>
              {t['URL']}
            </label>
            <input className='rte-input' id='name' onChange={handleChange} />
          </fieldset>
          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close asChild>
              <button className='button' onClick={handleSave}>
                {t['Save']}
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className='icon-button'
              aria-label='Close'
              onClick={props.onClose}
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
