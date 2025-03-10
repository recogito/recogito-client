import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useExtensions } from '@recogito/studio-sdk';
import { ConfirmedAction } from '@components/ConfirmedAction';
import { ExtensionMount } from '@components/Plugins';
import type { Context, Document, Translations } from 'src/Types';
import { 
  Browser, 
  Browsers, 
  CaretRight,
  Code,
  Detective,
  DotsThreeVertical, 
  DownloadSimple,
  FilePdf,
  PencilSimple, 
  Trash,
  UsersThree
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Sub, SubContent, SubTrigger, Trigger } = Dropdown;

interface DocumentCardActionsProps {

  allowDeleteDocument?: boolean;

  allowEditMetadata?: boolean;

  i18n: Translations;

  context: Context;

  document: Document;

  onOpen(tab: boolean): void;

  onDelete?(): void;

  onExportCSV?(includePrivate?: boolean): void;

  onExportTEI?(includePrivate?: boolean): void;

  onExportPDF?(includePrivate?: boolean): void;

  onOpenMetadata?(): void;
}

export const DocumentCardActions = (props: DocumentCardActionsProps) => {
  const { t } = props.i18n;

  const [confirming, setConfirming] = useState(false);

  const onOpen = (tab: boolean) => (evt: Event) => {
    evt.preventDefault();
    evt.stopPropagation();

    props.onOpen(tab);
  }

  const extensions = useExtensions('project:document-actions');

  const onExportTEI = (includePrivate: boolean) => () =>
    props.onExportTEI && props.onExportTEI(includePrivate);

  const onExportPDF = (includePrivate: boolean) => () =>
    props.onExportPDF && props.onExportPDF(includePrivate);

  const onExportCSV = (includePrivate: boolean) => () =>
    props.onExportCSV && props.onExportCSV(includePrivate);

  return (
    <ConfirmedAction.Root
      open={confirming}
      onOpenChange={setConfirming}>

      <Root>
        <Trigger asChild>
          <button 
            className="unstyled icon-only"
            aria-label={`${t['Menu actions for document:']} ${props.document.name}`}>
            <DotsThreeVertical weight="bold" size={22}/>
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

            {props.onOpenMetadata && (
              <Item className="dropdown-item" onSelect={props.onOpenMetadata}>
                <PencilSimple size={16} />
                <span>{ props.allowEditMetadata ? t['Edit document metadata'] : t['View document metadata']}</span>
              </Item>
            )}

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

            {props.document.content_type === 'application/pdf' && (
              <Sub>
                <SubTrigger className="dropdown-subtrigger">
                  <FilePdf size={16} /> <span>{t['Export PDF file']}</span>
                  <div className="right-slot">
                    <CaretRight size={16} />
                  </div>
                </SubTrigger>

                <Portal>
                  <SubContent
                    className="dropdown-subcontent"
                    alignOffset={-5}>

                    <Item className="dropdown-item" onSelect={onExportPDF(false)}>
                      <UsersThree size={16} /> {t['Public annotations only']}
                    </Item>

                    <Item className="dropdown-item" onSelect={onExportPDF(true)}>
                      <Detective size={16} /> {t['Include my private annotations']}
                    </Item>
                  </SubContent>
                </Portal>
              </Sub>
            )}

            <Sub>
              <SubTrigger className="dropdown-subtrigger">
                <DownloadSimple size={16} /> <span>{t['Export annotations as CSV']}</span>
                <div className="right-slot">
                  <CaretRight size={16} />
                </div>
              </SubTrigger>

              <Portal>
                <SubContent
                  className="dropdown-subcontent"
                  alignOffset={-5}>

                  <Item className="dropdown-item" onSelect={onExportCSV(false)}>
                    <UsersThree size={16} /> {t['Public annotations only']}
                  </Item>

                  <Item className="dropdown-item" onSelect={onExportCSV(true)}>
                    <Detective size={16} /> {t['Include my private annotations']}
                  </Item>
                </SubContent>
              </Portal>
            </Sub>

            {extensions.map(({ extension, config }) => (
              <ExtensionMount 
                key={extension.name} 
                extension={extension}
                pluginConfig={config} 
                projectId={props.context.project_id}
                contextId={props.context.id}
                documentId={props.document.id}
                />
            ))}
            
            {props.onOpenMetadata && (
              <Item className="dropdown-item" onSelect={props.onOpenMetadata}>
                <PencilSimple size={16} />
                <span>{ props.allowEditMetadata ? t['Edit document metadata'] : t['View document metadata']}</span>
              </Item>
            )}

            {props.allowDeleteDocument && (
              <ConfirmedAction.Trigger>
                <Item className="dropdown-item">
                  <Trash size={16} className="destructive" /> <span>{t['Delete document']}</span>
                </Item>
              </ConfirmedAction.Trigger>
            )}
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        title={t['Are you sure?']} 
        description={t['Are you sure you want to delete this document?']}
        cancelLabel={t['Cancel']} 
        confirmLabel={<><Trash size={16} /> <span>{t['Delete document']}</span></>}
        onConfirm={props.onDelete!} />
        
    </ConfirmedAction.Root>
  )

}