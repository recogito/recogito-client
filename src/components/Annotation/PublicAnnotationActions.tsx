import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThree, LinkSimple, Pencil, Trash } from '@phosphor-icons/react';
import { AdminOverrideAlert } from '@components/AnnotationDesktop';
import { useTranslation } from 'react-i18next';

interface PublicAnnotationActionsProps {
  canEdit?: boolean;

  isFirst: boolean;

  isMine: boolean;

  isNote?: boolean;

  onCopyLink(): void;

  onDeleteAnnotation(): void;

  onDeleteSection(): void;

  onEditSection(): void;
}

export const PublicAnnotationActions = (
  props: PublicAnnotationActionsProps
) => {
  const { t } = useTranslation(['a11y', 'annotation-common']);

  const [promptedFn, setPromptedFn] = useState<() => void | undefined>();

  const withPrompt = (fn: () => void) => {
    if (props.isMine) {
      return fn;
    } else {
      return () => setPromptedFn(() => fn);
    }
  };

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  };

  const onConfirm = () => {
    promptedFn!();
    setPromptedFn(undefined);
  };

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button
            className='comment-actions unstyled icon-only'
            aria-label={t('annotation action menu', { ns: 'a11y' })}
          >
            <DotsThree size={20} weight='bold' />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content
            asChild
            sideOffset={5}
            align='start'
            onClick={onClick}
          >
            <div className='dropdown-content no-icons'>
              {props.isFirst && (
                <Dropdown.Item
                  className='dropdown-item'
                  onSelect={props.onCopyLink}
                >
                  <LinkSimple size={16} />
                  <span>{t('Copy link to annotation', { ns: 'annotation-common' })}</span>
                </Dropdown.Item>
              )}

              {props.canEdit && (
                <>
                  <Dropdown.Item
                    className='dropdown-item'
                    onSelect={withPrompt(props.onEditSection)}
                  >
                    <Pencil size={16} />
                    {props.isFirst ? (
                      <span>{t('Edit annotation', { ns: 'annotation-common' })}</span>
                    ) : (
                      <span>{t('Edit reply', { ns: 'annotation-common' })}</span>
                    )}
                  </Dropdown.Item>

                  {props.isFirst ? (
                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={withPrompt(props.onDeleteAnnotation)}
                    >
                      <Trash size={16} /> <span>
                        {props.isNote
                          ? t('Delete note', { ns: 'annotation-common' })
                          : t('Delete annotation', { ns: 'annotation-common' })}
                      </span>
                    </Dropdown.Item>
                  ) : (
                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={withPrompt(props.onDeleteSection)}
                    >
                      <Trash size={16} /> <span>{t('Delete reply', { ns: 'annotation-common' })}</span>
                    </Dropdown.Item>
                  )}
                </>
              )}
            </div>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>

      <AdminOverrideAlert
        open={Boolean(promptedFn)}
        onConfirm={onConfirm}
        onCancel={() => setPromptedFn(undefined)}
      />
    </>
  );
};
