import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThree, Pencil, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { useState } from 'react';
import { AdminOverrideAlert } from '@components/AnnotationDesktop';

interface PublicAnnotationActionsProps {

  i18n: Translations;

  isFirst: boolean;

  isMine: boolean;

  onDeleteAnnotation(): void;

  onDeleteSection(): void;

  onEditSection(): void;

}

export const PublicAnnotationActions = (props: PublicAnnotationActionsProps) => {

  const { t } = props.i18n;

  const [promptedFn, setPromptedFn] = useState<() => void | undefined>();
  
  const withPrompt = (fn: () => void) => {
    if (props.isMine) {
      return fn;
    } else {
      return () => setPromptedFn(() => fn);
    }
  }

  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  const onConfirm = () => {
    promptedFn!();
    setPromptedFn(undefined);
  };

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className='comment-actions unstyled icon-only'>
            <DotsThree size={20} weight='bold' />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content asChild sideOffset={5} align="start" onClick={onClick}>
            <div className='dropdown-content no-icons'>
              <Dropdown.Item
                className='dropdown-item'
                onSelect={withPrompt(props.onEditSection)}>
                <Pencil size={16} /> 
                {props.isFirst ? (
                  <span>{t['Edit annotation']}</span>
                ) : (
                  <span>{t['Edit reply']}</span>
                )}
              </Dropdown.Item>

              {props.isFirst ? (
                <Dropdown.Item
                  className='dropdown-item'
                  onSelect={withPrompt(props.onDeleteAnnotation)}>
                  <Trash size={16} /> <span>{t['Delete annotation']}</span>
                </Dropdown.Item>
              ) : (
                <Dropdown.Item
                  className='dropdown-item'
                  onSelect={withPrompt(props.onDeleteSection)}>
                  <Trash size={16} /> <span>{t['Delete reply']}</span>
                </Dropdown.Item>
              )}
            </div>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>

      <AdminOverrideAlert
        i18n={props.i18n}
        open={Boolean(promptedFn)}
        onConfirm={onConfirm}
        onCancel={() => setPromptedFn(undefined)}
      />
    </>
  )

}
