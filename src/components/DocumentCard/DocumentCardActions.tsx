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
  UsersThree,
} from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Separator, Sub, SubContent, SubTrigger, Trigger } = Dropdown;

interface DocumentCardActionsProps {
  allowDeleteDocument?: boolean;

  allowEditMetadata?: boolean;

  i18n: Translations;

  context: Context;

  document: Document;

  onOpen(tab: boolean): void;

  onDelete?(): void;

  onExportCSV?(includePrivate?: boolean): void;

  onExportPDF?(includePrivate?: boolean): void;

  onExportTEI?(includePrivate?: boolean): void;

  onExportW3C?(includePrivate?: boolean): void;

  onExportManifest?(includePrivate?: boolean): void;

  onOpenMetadata?(): void;
}

export const DocumentCardActions = (props: DocumentCardActionsProps) => {

  const { t } = props.i18n;

  const [menuOpen, setMenuOpen] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const onOpen = (tab: boolean) => (evt: Event) => {
    evt.preventDefault();
    evt.stopPropagation();
    props.onOpen(tab);

    setMenuOpen(false);
  };

  const extensions = useExtensions('project:document-actions');

  const onExport = (fn: ((includePrivate?: boolean) => void) | undefined, includePrivate: boolean) => () => {
    fn && fn(includePrivate);
    setMenuOpen(false);
  }

  const onSelectOption = (fn?: () => void) => () => {
    fn && fn();
    setMenuOpen(false);
  }

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Trigger asChild>
          <button
            className='unstyled icon-only'
            aria-label={`${t['Menu actions for document:']} ${props.document.name}`}
          >
            <DotsThreeVertical weight='bold' size={22} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            <Item
              className='dropdown-item'
              onSelect={onOpen(false)}
              aria-label={t['open this document in current window']}
            >
              <Browser size={16} /> <span>{t['Open document']}</span>
            </Item>

            <Item
              className='dropdown-item'
              onSelect={onOpen(true)}
              aria-label={t['open this document in a new window']}
            >
              <Browsers size={16} />{' '}
              <span>{t['Open document in new tab']}</span>
            </Item>

            {props.onOpenMetadata && (
              <Item
                className='dropdown-item'
                onSelect={onSelectOption(props.onOpenMetadata)}
                aria-label={t['view this documents metadata']}
              >
                <PencilSimple size={16} />
                <span>
                  {props.allowEditMetadata
                    ? t['Edit document metadata']
                    : t['View document metadata']}
                </span>
              </Item>
            )}

            <Separator className="dropdown-separator" />

            {props.document.content_type === 'text/xml' && (
              <Sub>
                <SubTrigger className='dropdown-subtrigger'>
                  <Code size={16} /> <span>{t['Export TEI file']}</span>
                  <div className='right-slot'>
                    <CaretRight size={16} />
                  </div>
                </SubTrigger>

                <Portal>
                  <SubContent className='dropdown-subcontent' alignOffset={-5}>
                    <Item
                      className='dropdown-item'
                      onSelect={onExport(props.onExportTEI, false)}
                      aria-label={
                        t[
                          'export this document`s public annotations as a t e i file'
                        ]
                      }
                    >
                      <UsersThree size={16} /> {t['Public annotations only']}
                    </Item>

                    <Item
                      className='dropdown-item'
                      onSelect={onExport(props.onExportTEI, true)}
                      aria-label={
                        t[
                          'download this document`s public and your private annotations as a t e i file'
                        ]
                      }
                    >
                      <Detective size={16} />{' '}
                      {t['Include my private annotations']}
                    </Item>
                  </SubContent>
                </Portal>
              </Sub>
            )}

            {props.document.content_type === 'application/pdf' && (
              <Sub>
                <SubTrigger className='dropdown-subtrigger'>
                  <FilePdf size={16} /> <span>{t['Export PDF file']}</span>
                  <div className='right-slot'>
                    <CaretRight size={16} />
                  </div>
                </SubTrigger>

                <Portal>
                  <SubContent className='dropdown-subcontent' alignOffset={-5}>
                    <Item
                      className='dropdown-item'
                      onSelect={onExport(props.onExportPDF, false)}
                      aria-label={
                        t[
                          'export this document`s public annotations as a p d f file'
                        ]
                      }
                    >
                      <UsersThree size={16} /> {t['Public annotations only']}
                    </Item>

                    <Item
                      className='dropdown-item'
                      onSelect={onExport(props.onExportPDF, true)}
                      aria-label={
                        t[
                          'download this document`s public and your private annotations as a p d f file'
                        ]
                      }
                    >
                      <Detective size={16} />{' '}
                      {t['Include my private annotations']}
                    </Item>
                  </SubContent>
                </Portal>
              </Sub>
            )}

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
                  <Item
                    className='dropdown-item'
                    onSelect={onExport(props.onExportCSV, false)}
                    aria-label={
                      t[
                        'export this document`s public annotations as a c s v file'
                      ]
                    }
                  >
                    <UsersThree size={16} /> {t['Public annotations only']}
                  </Item>

                  <Item
                    className='dropdown-item'
                    onSelect={onExport(props.onExportCSV, true)}
                    aria-label={
                      t[
                        'download this document`s public and your private annotations as a c s v file'
                      ]
                    }
                  >
                    <Detective size={16} />{' '}
                    {t['Include my private annotations']}
                  </Item>
                </SubContent>
              </Portal>
            </Sub>

            <Sub>
              <SubTrigger className="dropdown-subtrigger">
                <DownloadSimple size={16} /> <span>{t['Export Annotations as W3C/JSONLD']}</span>
                <div className="right-slot">
                  <CaretRight size={14} />
                </div>
              </SubTrigger>

              <Portal>
                <SubContent
                  className="dropdown-subcontent"
                  alignOffset={-5}>

                  <Item className="dropdown-item" onSelect={onExport(props.onExportW3C, false)}>
                    <UsersThree size={16} /> {t['Public annotations only']}
                  </Item>

                  <Item className="dropdown-item" onSelect={onExport(props.onExportW3C, true)}>
                    <Detective size={16} /> {t['Include my private annotations']}
                  </Item>
                </SubContent>
              </Portal>
            </Sub>

            {props.document.meta_data?.protocol?.startsWith('IIIF') && (
              <Sub>
                <SubTrigger 
                  className="dropdown-subtrigger"
                  disabled={props.document.meta_data.protocol !== 'IIIF_PRESENTATION'}>
                  <DownloadSimple size={16} /> <span>{t['Export IIIF Manifest']}</span>
                  <div className="right-slot">
                    <CaretRight size={14} />
                  </div>
                </SubTrigger>

                <Portal>
                  <SubContent
                    className="dropdown-subcontent"
                    alignOffset={-5}>
                    
                    <Item className="dropdown-item" onSelect={onExport(props.onExportManifest, false)}>
                      <UsersThree size={16} /> {t['Public annotations only']}
                    </Item>

                    <Item className="dropdown-item" onSelect={onExport(props.onExportManifest, true)}>
                      <Detective size={16} /> {t['Include my private annotations']}
                    </Item>
                  </SubContent>
                </Portal>
              </Sub>
            )}

            {extensions.length > 0 && (
              <Separator className="dropdown-separator" />
            )}

            {extensions.map(({ extension, config }) => (
              <ExtensionMount
                key={extension.name}
                extension={extension}
                pluginConfig={config}
                projectId={props.context.project_id}
                context={props.context}
                document={props.document}
                closeDialog={() => setMenuOpen(false)}
              />
            ))}
            
            {props.allowDeleteDocument && (
              <>
                <Separator className="dropdown-separator" />
                
                <ConfirmedAction.Trigger>
                  <Item
                    className='dropdown-item'
                    aria-label={t['remove this document from the project']}
                  >
                    <Trash size={16} className='destructive' />{' '}
                    <span>{t['Delete document']}</span>
                  </Item>
                </ConfirmedAction.Trigger>
              </>
            )}
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        i18n={props.i18n}
        title={t['Are you sure?']}
        description={t['Are you sure you want to delete this document?']}
        cancelLabel={t['Cancel']}
        confirmLabel={
          <>
            <Trash size={16} /> <span>{t['Delete document']}</span>
          </>
        }
        onConfirm={onSelectOption(props.onDelete)}
      />
    </ConfirmedAction.Root>
  );
};
