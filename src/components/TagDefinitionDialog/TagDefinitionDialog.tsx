import { Button } from '@components/Button';
import { X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useEffect, useState } from 'react';
import type { TagDefinition } from 'src/Types.ts';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';
import './TagDefinitionDialog.css';

interface Props {
  busy?: boolean;

  description: string;

  onCancel(): void;

  onSaved(name: string): void;

  open: boolean;

  tagDefinition?: TagDefinition,

  title: string;
}

export const TagDefinitionDialog = (props: Props) => {
  const [name, setName] = useState('');

  const { t } = useTranslation(['common']);

  useEffect(() => {
    if (props.tagDefinition) {
      setName(props.tagDefinition.name);
    } else {
      setName('');
    }
  }, [props.open, props.tagDefinition]);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='dialog-content'>
          <Dialog.Title className='dialog-title project-group-dialog-title'>
            <span>{props.title}</span>
            <Dialog.Close asChild>
              <button
                className='unstyled icon-only'
                onClick={props.onCancel}
              >
                <X size={24} />
              </button>
            </Dialog.Close>
          </Dialog.Title>

          <VisuallyHidden.Root asChild>
            <Dialog.Description>{props.description}</Dialog.Description>
          </VisuallyHidden.Root>

          <div className='project-group-root'>
            <div className='form'>
              <Label.Root className='text-body-small-bold'>
                {t('Name', { ns: 'common' })}
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
                {t('Cancel', { ns: 'common' })}
              </button>

              <Button
                busy={props.busy}
                className='primary'
                onClick={() => props.onSaved(name)}
              >
                <span>
                  {t('Create', { ns: 'common' })}
                </span>
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};