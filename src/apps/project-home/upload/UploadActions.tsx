import { type ReactNode, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { FileIcon, FileArrowDownIcon, LinkSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { IIIFDialog, type IIIFManifest } from './dialogs';
import type { MyProfile, Protocol } from 'src/Types';
import { EULAModal } from '@components/EULAModal/EULAModal';
import { setProfileEULAAccepted } from '@backend/helpers/profileHelpers';
import './UploadActions.css';
import { supabase } from '@backend/supabaseBrowserClient';
import { useTranslation } from 'react-i18next';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface UploadActionsProps {
  me: MyProfile;

  onUpload(): void;

  onImport(format: Protocol, url: string, label?: string): void;

  onOpenLibrary?(): void;

  onSetUser(user: MyProfile): void;
}

export const UploadActions = (props: UploadActionsProps) => {
  const { t } = useTranslation(['common', 'project-home']);

  const [dialog, setDialog] = useState<ReactNode | undefined>();
  const [eulaOpen, setEulaOpen] = useState(false);

  const onImportIIIF = () => {
    const onSubmit = (manifest: IIIFManifest) => {
      setDialog(undefined);
      props.onImport(manifest.protocol, manifest.url, manifest.label);
    };

    setDialog(
      <IIIFDialog
        onCancel={() => setDialog(undefined)}
        onSubmit={onSubmit}
      />
    );
  };

  const handleUpload = () => {
    if (!props.me.accepted_eula && import.meta.env.PUBLIC_EULA_URL) {
      setEulaOpen(true);
    } else {
      props.onUpload();
    }
  };

  const handleConfirmUpload = async () => {
    setEulaOpen(false);
    const { data, error } = await setProfileEULAAccepted(supabase, props.me.id);
    if (error) {
      console.log(error);
    } else {
      props.onSetUser(data);
      props.onUpload();
    }
  };

  return (
    <>
      <Root>
        <Trigger asChild>
          <button className='primary'>
            <PlusIcon size={20} /> <span>{t('Import', { ns: 'common' })}</span>
          </button>
        </Trigger>

        <Portal>
          <Content
            className='upload-dropdown dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            <Item className='dropdown-item' onSelect={handleUpload}>
              <FileIcon size={16} />
              <div>
                <span>{t('File upload', { ns: 'project-home' })}</span>
                <p>.txt .xml .jpg .png .tif .gif .jp2 .bmp .pdf</p>
              </div>
            </Item>

            <Item className='dropdown-item' onSelect={onImportIIIF}>
              <LinkSimpleIcon size={16} />
              <div>
                <span>{t('From IIIF image manifest', { ns: 'project-home' })}</span>
                <p>{t('IIIF import hint', { ns: 'project-home' })}</p>
              </div>
            </Item>
            {props.onOpenLibrary && (
              <Item className='dropdown-item' onSelect={props.onOpenLibrary}>
                <FileArrowDownIcon size={16} />
                <div>
                  <span>{t('From existing project', { ns: 'project-home' })}</span>
                  <p>{t('Import an existing document from a project.', { ns: 'project-home' })}</p>
                </div>
              </Item>
            )}
          </Content>
        </Portal>
      </Root>

      {dialog}
      <EULAModal
        open={eulaOpen}
        onCancel={() => setEulaOpen(false)}
        onConfirm={handleConfirmUpload}
      />
    </>
  );
};
