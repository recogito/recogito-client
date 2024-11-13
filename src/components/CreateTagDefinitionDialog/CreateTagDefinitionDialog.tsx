import { Button } from '@components/Button';
import { X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { useEffect, useState } from 'react';
import type { Translations } from '../../Types.ts';
import './CreateTagDefinitionDialog.css';

interface Props {
  busy?: boolean;

  i18n: Translations;

  onCancel(): void;

  onSaved(name: string): void;

  open: boolean;

  title: string;
}

export const CreateTagDefinitionDialog = (props: Props) => {
  const [name, setName] = useState('');

  const { t } = props.i18n;

  useEffect(() => {
    setName('');
  }, [props.open]);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title project-group-dialog-title'>
            <h1>{props.title}</h1>
            <Dialog.Close asChild>
              <button
                className='unstyled icon-only'
                onClick={props.onCancel}
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </Dialog.Title>
          <div className='project-group-root'>
            <div className='form'>
              <Label.Root className='text-body-small-bold'>
                {t['Name']}
              </Label.Root>
              <input
                autoFocus
                onChange={(evt) => setName(evt.target.value)}
                type='text'
                value={name}
              />
            </div>
            <div className='buttons'>
              <button onClick={props.onCancel}>
                {t['Cancel']}
              </button>

              <Button
                busy={props.busy}
                className='primary'
                onClick={() => props.onSaved(name)}
              >
                <span>
                  {t['Create']}
                </span>
              </Button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};