import { ReactNode, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Image, Link, Video } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

export interface EmbedDialogProps {

  i18n: Translations;

  onSave(url: string): void;

  onCancel(): void;

}

export const EmbedLinkDialog = (props: EmbedDialogProps) => {

  return (
    <EmbedDialog 
      {...props}
      icon={<Link />} 
      title="Embed URL" 
      message="Embed a URL" />
  )

}

export const EmbedImageDialog = (props: EmbedDialogProps) => {

  return (
    <EmbedDialog 
      {...props}
      icon={<Image />} 
      title="Embed Image" 
      message="Embed an Image" />
  )

}

export const EmbedYouTubeDialog = (props: EmbedDialogProps) => {

  return (
    <EmbedDialog 
      {...props}
      icon={<Video />} 
      title="Embed Video" 
      message="Embed a video from YouTube" />
  )

}

interface GenericEmbedDialogProps {

  icon: ReactNode;

  i18n: Translations;

  message: string;

  title: ReactNode;

  onSave(url: string): void;

  onCancel(): void;

}

const EmbedDialog = (props: GenericEmbedDialogProps) => {

  const [value, setValue] = useState('');

  const { t } = props.i18n;

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay not-annotatable" />
        
        <Dialog.Content className="dialog-content not-annotatable">
          <Dialog.Title className='dialog-title'>Embed</Dialog.Title>
          <Dialog.Description className='dialog-description'>
            Embed something
          </Dialog.Description>

          <label 
            htmlFor="url">
            {t['URL']}
          </label>

          <input 
            id="url" 
            onChange={e => setValue(e.target.value)} />

          <div>
            <button 
              onClick={() => props.onSave(value)}>
              {t['Save']}
            </button>

            <button 
              onClick={() => props.onCancel()}>
              {t['Cancel']}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}