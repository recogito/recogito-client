import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { Translations } from 'src/Types';
import {
  DotsThreeVertical,
  CheckSquare,
  Square,
  CheckCircle,
} from '@phosphor-icons/react';
import type { LibraryDocument } from './DocumentLibrary';
import type { Action } from '@table-library/react-table-library/types/common';
import * as Tooltip from '@radix-ui/react-tooltip';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface CollectionDocumentActionsProps {
  i18n: Translations;
  disabledIds: string[];
  selectedIds: string[];
  revisions: LibraryDocument[];
  onSelectVersion(action: Action, _state: any): void;
}

export const CollectionDocumentActions = (
  props: CollectionDocumentActionsProps
) => {
  const { t } = props.i18n;

  const [confirming, setConfirming] = useState(false);

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root>
        <Tooltip.Provider>
          <Tooltip.Root>
            <Trigger asChild>
              <Tooltip.Trigger asChild>
                <button className='unstyled icon-only'>
                  <DotsThreeVertical weight='bold' size={20} />
                </button>
              </Tooltip.Trigger>
            </Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className='tooltip-content' sideOffset={5}>
                {t['Select Revision']}
                <Tooltip.Arrow className='tooltip-arrow' />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            {props.revisions.map((r: LibraryDocument, idx: number) => {
              if (props.disabledIds.includes(r.id)) {
                return (
                  <Item className='dropdown-item' key={idx}>
                    <CheckCircle size={24} />{' '}
                    <span>{`${t['Revision']}: ${r.collection_metadata?.revision_number}, ${t['Published Date']}: ${r.published_date}`}</span>
                  </Item>
                );
              }
              return (
                <Item
                  className='dropdown-item'
                  onSelect={() => {
                    const type = props.selectedIds?.includes(r.id)
                      ? 'REMOVE_BY_IDS'
                      : 'ADD_BY_IDS';

                    props.onSelectVersion(
                      {
                        type: type,
                        payload: {
                          ids: [r.id],
                        },
                      },
                      {}
                    );
                  }}
                  key={idx}
                >
                  {props.selectedIds?.includes(r.id) ? (
                    <CheckSquare color='blue' size={24} weight='fill' />
                  ) : (
                    <Square size={24} />
                  )}{' '}
                  <span>{`${t['Revision']}: ${r.collection_metadata?.revision_number}, ${t['Published Date']}: ${r.published_date}`}</span>
                </Item>
              );
            })}
          </Content>
        </Portal>
      </Root>
    </ConfirmedAction.Root>
  );
};
