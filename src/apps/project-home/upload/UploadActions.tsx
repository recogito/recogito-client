
import { ReactNode, useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { File, LinkSimple, Plus } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { IIIFDialog } from './dialogs';

import './UploadActions.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

// For future extension...
export type UploadFormat = 'IIIF';

interface UploadActionsProps {

  i18n: Translations;

  onUpload(): void;

  onImport(format: UploadFormat, url: string): void;

}

export const UploadActions = (props: UploadActionsProps) => {

  const { t } = props.i18n;

  const [dialog, setDialog] = useState<ReactNode | undefined>();

  const onImportIIIF = () => {
    const onSubmit = (url: string) => {
      setDialog(undefined);
      props.onImport('IIIF', url);
    }

    setDialog(
      <IIIFDialog 
        i18n={props.i18n} 
        onCancel={() => setDialog(undefined)}
        onSubmit={onSubmit}/>
    );
  }

  return (
    <>
      <Root>
        <Trigger asChild>
          <button className="primary">
            <Plus size={20} /> <span>{t['Import Document']}</span>
          </button>
        </Trigger>

        <Portal>
          <Content 
            className="upload-dropdown dropdown-content no-icons" 
            sideOffset={5} 
            align="start">
            <Item className="dropdown-item" onSelect={props.onUpload}>
              <File size={16} /> 
              <div>
                <span>{t['File upload']}</span>
                <p>
                  .txt .xml .jpg .png
                </p>
              </div>
            </Item>

            <Item className="dropdown-item" onSelect={onImportIIIF}>
              <LinkSimple size={16} /> 
              <div>
                <span>{t['From IIIF manifest']}</span>
                <p>{t['v2 or v3 image info.json']}</p>
              </div>
            </Item>
          </Content>
        </Portal>
      </Root>

      {dialog}
    </>
  )

}