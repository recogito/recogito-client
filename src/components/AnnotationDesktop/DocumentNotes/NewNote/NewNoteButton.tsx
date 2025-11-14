import { CaretDown, Detective, PlusCircle } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useTranslation } from 'react-i18next';

interface NewNoteButtonProps {

  onCreatePublic(): void;

  onCreatePrivate(): void;
}

export const NewNoteButton = (props: NewNoteButtonProps) => {
  const { t } = useTranslation(['annotation-common']);

  return (
    <div className='document-notes-list-create-new'>
      <button className='tiny flat' onClick={props.onCreatePublic}>
        <PlusCircle size={16} />
        <span>{t('New Note', { ns: 'annotation-common' })}</span>
      </button>

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className='tiny flat' aria-label={t('New Note', { ns: 'annotation-common' })}>
            <CaretDown size={12} />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content align='center' className='dropdown-content'>
            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onCreatePublic}
            >
              <PlusCircle size={16} />
              <span>{t('Create new public note', { ns: 'annotation-common' })}</span>
            </Dropdown.Item>

            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onCreatePrivate}
            >
              <Detective size={16} />
              <span>{t('Create new private note', { ns: 'annotation-common' })}</span>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </div>
  );
};
