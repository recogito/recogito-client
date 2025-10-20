import { type ReactNode, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { FileIcon, FileArrowDownIcon, LinkSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { IIIFDialog, type IIIFManifest } from './dialogs';
import type { MyProfile, Protocol, Translations } from 'src/Types';
import { EULAModal } from '@components/EULAModal/EULAModal';
import { setProfileEULAAccepted } from '@backend/helpers/profileHelpers';
import './UploadActions.css';
import { supabase } from '@backend/supabaseBrowserClient';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface UploadActionsProps {
  me: MyProfile;

  i18n: Translations;

  onUpload(): void;

  onImport(format: Protocol, url: string, label?: string): void;

  onOpenLibrary?(): void;

  onSetUser(user: MyProfile): void;
}

export const UploadActions = (props: UploadActionsProps) => {
  const { t } = props.i18n;

  const [dialog, setDialog] = useState<ReactNode | undefined>();
  const [eulaOpen, setEulaOpen] = useState(false);

  const onImportIIIF = () => {
    const onSubmit = (manifest: IIIFManifest) => {
      setDialog(undefined);
      props.onImport(manifest.protocol, manifest.url, manifest.label);
    };

    setDialog(
      <IIIFDialog
        i18n={props.i18n}
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
            <PlusIcon size={20} /> <span>{t['Import']}</span>
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
                <span>{t['File upload']}</span>
                <p>.txt .xml .jpg .png .tif .gif .jp2 .bmp .pdf</p>
              </div>
            </Item>

            <Item className='dropdown-item' onSelect={onImportIIIF}>
              <LinkSimpleIcon size={16} />
              <div>
                <span>{t['From IIIF image manifest']}</span>
                <p>{t['IIIF import hint']}</p>
              </div>
            </Item>
            {props.onOpenLibrary && (
              <Item className='dropdown-item' onSelect={props.onOpenLibrary}>
                <FileArrowDownIcon size={16} />
                <div>
                  <span>{t['From existing project']}</span>
                  <p>{t['Import an existing document from a project.']}</p>
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
        i18n={props.i18n}
      />
    </>
  );
};
