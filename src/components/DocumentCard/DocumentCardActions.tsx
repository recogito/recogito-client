import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { Context, Document, Translations } from 'src/Types';
import { 
  Browser, 
  Browsers, 
  CaretRight,
  Code,
  Detective,
  DotsThreeVertical, 
  DownloadSimple,
  PencilSimple, 
  Trash,
  UsersThree
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Sub, SubContent, SubTrigger, Trigger } = Dropdown;

interface DocumentCardActionsProps {

  i18n: Translations;

  isAdmin?: boolean;

  context: Context;

  document: Document;

  onOpen(tab: boolean): void;

  onDelete?(): void;

  onEditMetadata?(): void;

  onExportCSV?(): void;

  onExportTEI?(includePrivate?: boolean): void;

}

export const DocumentCardActions = (props: DocumentCardActionsProps) => {

  const { t } = props.i18n;

  const [confirming, setConfirming] = useState(false);

  const onOpen = (tab: boolean) => (evt: Event) => {
    evt.preventDefault();
    evt.stopPropagation();

    props.onOpen(tab);
  }

  const onExportTEI = (includePrivate: boolean) => (evt: Event) =>
    props.onExportTEI && props.onExportTEI(includePrivate);

  return (
    <ConfirmedAction.Root
      open={confirming}
      onOpenChange={setConfirming}>

      <Root>
        <Trigger asChild>
          <button className="unstyled icon-only">
            <DotsThreeVertical weight="bold" size={20}/>
          </button>
        </Trigger>

        <Portal>
          <Content className="dropdown-content no-icons" sideOffset={5} align="start">
            <Item className="dropdown-item" onSelect={onOpen(false)}>
              <Browser size={16} /> <span>{t['Open document']}</span>
            </Item>

            <Item className="dropdown-item" onSelect={onOpen(true)}>
              <Browsers size={16} /> <span>{t['Open document in new tab']}</span>
            </Item>

            {props.document.content_type === 'text/xml' && (
              <Sub>
                <SubTrigger className="dropdown-subtrigger">
                  <Code size={16} /> <span>{t['Export TEI file']}</span>
                  <div className="right-slot">
                    <CaretRight size={16} />
                  </div>
                </SubTrigger>

                <Portal>
                  <SubContent
                    className="dropdown-subcontent"
                    alignOffset={-5}>

                    <Item className="dropdown-item" onSelect={onExportTEI(false)}>
                      <UsersThree size={16} /> {t['Public annotations only']}
                    </Item>

                    <Item className="dropdown-item" onSelect={onExportTEI(true)}>
                      <Detective size={16} /> {t['Include my private annotations']}
                    </Item>
                  </SubContent>
                </Portal>
              </Sub>
            )}

            <Item className="dropdown-item" onSelect={props.onExportCSV}>
              <DownloadSimple size={16} /> <span>{t['Export annotations as CSV']}</span>
            </Item>

            {props.isAdmin && (
              <>
                <Item className="dropdown-item" onSelect={props.onEditMetadata}>
                  <PencilSimple size={16} /> <span>{t['Edit document metadata']}</span>
                </Item>

                <ConfirmedAction.Trigger>
                  <Item className="dropdown-item">
                    <Trash size={16} className="destructive" /> <span>{t['Delete document']}</span>
                  </Item>
                </ConfirmedAction.Trigger>
              </>
            )}
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        title={t['Are you sure?']} 
        description={t['Are you sure you want to delete this document?']}
        cancelLabel={t['Cancel']} 
        confirmLabel={<><Trash size={16} /> <span>{t['Delete document']}</span></>}
        onConfirm={props.onDelete!} />
        
    </ConfirmedAction.Root>
  )

}