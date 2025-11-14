import { useState } from 'react';
import { ConfirmDelete } from './ConfirmDelete';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Context } from 'src/Types';
import {
  CaretRight,
  Detective,
  DotsThree,
  DownloadSimple,
  PencilSimple,
  Trash,
  UsersThree,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

const { Content, Item, Portal, Root, Sub, SubContent, SubTrigger, Trigger } =
  Dropdown;

interface AssignmentsActionsProps {

  isAdmin?: boolean;

  context: Context;

  onDelete(): void;

  onEdit(): void;

  onExportCSV(includePrivate?: boolean): void;
}

export const AssignmentsActions = (props: AssignmentsActionsProps) => {
  const { t } = useTranslation(['project-assignments', 'common']);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const onExportCSV = (includePrivate: boolean) => () =>
    props.onExportCSV && props.onExportCSV(includePrivate);

  return (
    <>
      <Root>
        <Trigger asChild>
          <button
            className='unstyled icon-only-large'
            aria-label={`${t('Menu actions for assignment:', { ns: 'project-assignments' })} ${props.context.name}`}
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
              <PencilSimple size={16} /> <span>{t('Edit', { ns: 'project-assignments' })}</span>
            </Item>

            <Sub>
              <SubTrigger className='dropdown-subtrigger'>
                <DownloadSimple size={16} />{' '}
                <span>{t('Export annotations as CSV', { ns: 'project-assignments' })}</span>
                <div className='right-slot'>
                  <CaretRight size={16} />
                </div>
              </SubTrigger>

              <Portal>
                <SubContent className='dropdown-subcontent' alignOffset={-5}>
                  <Item className='dropdown-item' onSelect={onExportCSV(false)}>
                    <UsersThree size={16} /> {t('Public annotations only', { ns: 'common' })}
                  </Item>

                  <Item className='dropdown-item' onSelect={onExportCSV(true)}>
                    <Detective size={16} />{' '}
                    {t('Include my private annotations', { ns: 'common' })}
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
                  <span>{t('Delete assignment', { ns: 'project-assignments' })}</span>
                </Item>
              </>
            )}
          </Content>
        </Portal>
      </Root>
      <ConfirmDelete
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
