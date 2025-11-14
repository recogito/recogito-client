import { useState, type ReactNode } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { ConfirmedAction } from '@components/ConfirmedAction';
import type { Document, Protocol } from 'src/Types';
import {
  CaretLeftIcon,
  DotsThreeVertical,
  File,
  LinkSimple,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react';
import {
  IIIFDialog,
  type IIIFManifest,
} from '@apps/project-home/upload/dialogs';
import type { LibraryDocument } from '@components/DocumentLibrary';
import { useTranslation } from 'react-i18next';

const {
  Content,
  Item,
  Portal,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} = Dropdown;

interface CollectionManagementDocumentActionsProps {

  document: LibraryDocument;

  onDelete(document?: Document): void;

  onImport(
    format: Protocol,
    url: string,
    label?: string,
    document?: Document
  ): void;

  onUpload(document?: Document): void;

  onOpenMetadata?(): void;
}

export const CollectionManagementDocumentActions = (
  props: CollectionManagementDocumentActionsProps
) => {
  const { t } = useTranslation(['common', 'project-home', 'a11y', 'collection-management']);

  const [menuOpen, setMenuOpen] = useState(false);

  const [confirming, setConfirming] = useState(false);

  const [dialog, setDialog] = useState<ReactNode | undefined>();

  const onImportIIIF = () => {
    const onSubmit = (manifest: IIIFManifest) => {
      setDialog(undefined);
      props.onImport(
        manifest.protocol,
        manifest.url,
        manifest.label,
        props.document
      );
    };

    setDialog(
      <IIIFDialog
        onCancel={() => setDialog(undefined)}
        onSubmit={onSubmit}
      />
    );
  };

  const onSelectOption = (fn?: () => void) => () => {
    fn?.();
    setMenuOpen(false);
  };

  return (
    <ConfirmedAction.Root open={confirming} onOpenChange={setConfirming}>
      <Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Trigger asChild>
          <button
            className='unstyled icon-only'
            aria-label={`${t('Menu actions for document:', { ns: 'common' })} ${props.document.name}`}
          >
            <DotsThreeVertical weight='bold' size={22} />
          </button>
        </Trigger>

        <Portal>
          <Content
            className='dropdown-content no-icons'
            sideOffset={5}
            align='end'
          >
            {props.onOpenMetadata && (
              <Item
                className='dropdown-item'
                onSelect={onSelectOption(props.onOpenMetadata)}
                aria-label={t("view this document's metadata", { ns: 'collection-management' })}
              >
                <PencilSimple size={16} />
                <span>{t('Edit document metadata', { ns: 'project-home' })}</span>
              </Item>
            )}
            <Sub>
              <SubTrigger
                className='dropdown-item'
                aria-label={t('import new revision of this document', { ns: 'a11y' })}
              >
                <CaretLeftIcon size={16} />
                <span>{t('Import new revision', { ns: 'collection-management' })}</span>
              </SubTrigger>
              <Portal>
                <SubContent className='dropdown-content'>
                  <Item
                    className='dropdown-item'
                    onSelect={() => props.onUpload(props.document)}
                  >
                    <File size={16} />
                    <div>
                      <span>{t('File upload', { ns: 'project-home' })}</span>
                      <p>.txt .xml .jpg .png .tif .gif .jp2 .bmp .pdf</p>
                    </div>
                  </Item>

                  <Item className='dropdown-item' onSelect={onImportIIIF}>
                    <LinkSimple size={16} />
                    <div>
                      <span>{t('From IIIF image manifest', { ns: 'project-home' })}</span>
                      <p>{t('IIIF import hint', { ns: 'project-home' })}</p>
                    </div>
                  </Item>
                </SubContent>
              </Portal>
            </Sub>

            <Separator className='dropdown-separator' />

            <ConfirmedAction.Trigger>
              <Item
                className='dropdown-item'
                aria-label={t('remove this document from the collection', { ns: 'collection-management' })}
              >
                <Trash size={16} className='destructive' />{' '}
                <span>
                  {props.document.revisions &&
                  props.document.revisions?.length > 1
                    ? t('Delete latest revision', { ns: 'collection-management' })
                    : t('Delete document', { ns: 'common' })}
                </span>
              </Item>
            </ConfirmedAction.Trigger>
          </Content>
        </Portal>
      </Root>

      <ConfirmedAction.Dialog
        title={t('Are you sure?', { ns: 'common' })}
        description={
          t('Are you sure you want to remove the document from the document library? Only documents that are not used by active projects can be removed.', { ns: 'project-home' })
        }
        cancelLabel={t('Cancel', { ns: 'common' })}
        confirmLabel={
          <>
            <Trash size={16} /> <span>{t('Delete document', { ns: 'common' })}</span>
          </>
        }
        onConfirm={onSelectOption(() => props.onDelete(props.document))}
      />
      {dialog}
    </ConfirmedAction.Root>
  );
};
