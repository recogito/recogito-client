import { useState } from 'react';
import { ConfirmDelete } from './ConfirmDelete';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Context, Translations } from 'src/Types';
import {
  CaretRight,
  Detective,
  DotsThree,
  DownloadSimple,
  PencilSimple,
  Trash,
  UsersThree,
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Sub, SubContent, SubTrigger, Trigger } =
  Dropdown;

interface AssignmentsActionsProps {
  i18n: Translations;

  isAdmin?: boolean;

  context: Context;

  onDelete(): void;

  onEdit(): void;

  onExportCSV(includePrivate?: boolean): void;
}

export const AssignmentsActions = (props: AssignmentsActionsProps) => {
  const { t } = props.i18n;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onExportCSV = (includePrivate: boolean) => () =>
    props.onExportCSV && props.onExportCSV(includePrivate);

  return (
    <>
      <Root>
        <Trigger asChild>
          <button
            className='unstyled icon-only-large'
            aria-label={`${t['Menu actions for assignment:']} ${props.context.name}`}
          >
            <DotsThree weight='bold' size={32} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            <Item className='dropdown-item' onSelect={props.onEdit}>
              <PencilSimple size={16} /> <span>{t['Edit']}</span>
            </Item>

            <Sub>
              <SubTrigger className='dropdown-subtrigger'>
                <DownloadSimple size={16} />{' '}
                <span>{t['Export annotations as CSV']}</span>
                <div className='right-slot'>
                  <CaretRight size={16} />
                </div>
              </SubTrigger>

              <Portal>
                <SubContent className='dropdown-subcontent' alignOffset={-5}>
                  <Item className='dropdown-item' onSelect={onExportCSV(false)}>
                    <UsersThree size={16} /> {t['Public annotations only']}
                  </Item>

                  <Item className='dropdown-item' onSelect={onExportCSV(true)}>
                    <Detective size={16} />{' '}
                    {t['Include my private annotations']}
                  </Item>
                </SubContent>
              </Portal>
            </Sub>

            {props.isAdmin && (
              <>
                <Item
                  className='dropdown-item'
                  onSelect={() => {
                    setConfirmOpen(true);
                  }}
                >
                  <Trash size={16} className='destructive' />{' '}
                  <span>{t['Delete assignment']}</span>
                </Item>
              </>
            )}
          </Content>
        </Portal>
      </Root>
      <ConfirmDelete
        i18n={props.i18n}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          props.onDelete();
        }}
      />
    </>
  );
};
