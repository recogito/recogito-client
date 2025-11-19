import * as Dropdown from '@radix-ui/react-dropdown-menu';
import {
  DotsThree,
  LinkSimple,
  Pencil,
  Trash,
  UsersThree,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface PrivateAnnotationActionsProps {

  isFirst: boolean;

  isNote?: boolean;

  onCopyLink(): void;

  onDeleteAnnotation(): void;

  onDeleteSection(): void;

  onEditSection(): void;

  onMakePublic(): void;
}

export const PrivateAnnotationActions = (
  props: PrivateAnnotationActionsProps
) => {
  const { t } = useTranslation(['a11y', 'annotation-common']);

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          className='comment-actions unstyled icon-only'
          aria-label={t('annotation action menu', { ns: 'a11y' })}
        >
          <DotsThree size={20} weight='bold' />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content asChild sideOffset={5} align='start' onClick={onClick}>
        <div className='dropdown-content no-icons'>
          <Dropdown.Item className='dropdown-item' onSelect={props.onCopyLink}>
            <LinkSimple size={16} />
            <span>{t('Copy link to annotation', { ns: 'annotation-common' })}</span>
          </Dropdown.Item>

          <Dropdown.Item
            className='dropdown-item'
            onSelect={props.onEditSection}
          >
            <Pencil size={16} />
            {props.isFirst ? (
              <span>{t('Edit annotation', { ns: 'annotation-common' })}</span>
            ) : (
              <span>{t('Edit reply', { ns: 'annotation-common' })}</span>
            )}
          </Dropdown.Item>

          {props.isFirst ? (
            <>
              <Dropdown.Item
                className='dropdown-item'
                onSelect={props.onMakePublic}
              >
                <UsersThree size={16} />{' '}
                <span>{t('Make annotation public', { ns: 'annotation-common' })}</span>
              </Dropdown.Item>

              <Dropdown.Item
                className='dropdown-item'
                onSelect={props.onDeleteAnnotation}
              >
                <Trash size={16} /> <span>
                  {props.isNote
                    ? t('Delete note', { ns: 'annotation-common' })
                    : t('Delete annotation', { ns: 'annotation-common' })}
                </span>
              </Dropdown.Item>
            </>
          ) : (
            <Dropdown.Item
              className='dropdown-item'
              onSelect={props.onDeleteSection}
            >
              <Trash size={16} /> <span>{t('Delete reply', { ns: 'annotation-common' })}</span>
            </Dropdown.Item>
          )}
        </div>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
