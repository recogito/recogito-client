import { type ReactNode, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { File, LinkSimple, Plus } from '@phosphor-icons/react';
import { IIIFDialog, type IIIFManifest } from './dialogs';
import type { Protocol, Translations } from 'src/Types';

import './UploadActions.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface UploadActionsProps {

  i18n: Translations;

  onUpload(): void;

  onImport(format: Protocol, url: string, label?: string): void;

}

export const UploadActions = (props: UploadActionsProps) => {
  const { t } = props.i18n;

  const [dialog, setDialog] = useState<ReactNode | undefined>();

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

  return (
    <>
      <Root>
        <Trigger asChild>
          <button className='primary'>
            <Plus size={20} /> <span>{t['Import']}</span>
          </button>
        </Trigger>

        <Portal>
          <Content
            className='upload-dropdown dropdown-content no-icons'
            sideOffset={5}
            align='start'
          >
            <Item className='dropdown-item' onSelect={props.onUpload}>
              <File size={16} />
              <div>
                <span>{t['File upload']}</span>
                <p>.txt .xml .jpg .png .tif .gif .jp2 .bmp .pdf</p>
              </div>
            </Item>

            <Item className='dropdown-item' onSelect={onImportIIIF}>
              <LinkSimple size={16} />
              <div>
                <span>{t['From IIIF image manifest']}</span>
                <p>{t['IIIF import hint']}</p>
              </div>
            </Item>
          </Content>
        </Portal>
      </Root>

      {dialog}
    </>
  );
};
