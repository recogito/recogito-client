import { CaretDown, Detective, PlusCircle } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Translations } from 'src/Types';

interface NewNoteButtonProps {
  i18n: Translations;

  onCreatePublic(): void;

  onCreatePrivate(): void;
}

export const NewNoteButton = (props: NewNoteButtonProps) => {
  const { t } = props.i18n;

  return (
    <div className='document-notes-list-create-new'>
      <button className='tiny flat' onClick={props.onCreatePublic}>
        <PlusCircle size={16} />
        <span>{t['New Note']}</span>
      </button>

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className='tiny flat' aria-label={t['New Note']}>
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
              <span>{t['Create new public note']}</span>
            </Dropdown.Item>

            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onCreatePrivate}
            >
              <Detective size={16} />
              <span>{t['Create new private note']}</span>
            </Dropdown.Item>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>
    </div>
  );
};
