import { type ReactNode, useMemo, useState } from 'react';
import type { Range } from 'quill';
import * as Dialog from '@radix-ui/react-dialog';
import { Image, Video } from '@phosphor-icons/react';
import { useQuillEditor } from './QuillEditorRoot';
import { parseYoutubeURL } from './quillEmbedUtils';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './QuillEmbedDialog.css';

export interface QuillEmbedDialogProps {

  onClose(): void;

}

interface EmbedDialogProps {

  icon?: ReactNode;

  message?: string;

  placeholder?: string; 

  title: ReactNode;

  onSave(url: string, selection?: Range | null): void;

  onCancel(): void;

}

export const EmbedLinkDialog = (props: QuillEmbedDialogProps) => {

  const { t } = useTranslation(['annotation-common']);

  const { quill } = useQuillEditor();

  const onSave = (url: string, range?: Range) => {
    if (!quill) return; // Should never happen

    if (range) { // Range is defined, unless the editor has no focus or is disabled
      if (range.length === 0)
        quill.insertText(range.index, url, 'link', url);
      else
        quill.format('link', url);
    } else {
      const start = quill.getLength();
      quill.insertText(start, url, 'user');
      quill.setSelection(start, url.length);
      quill.formatText(start, url.length, 'link', url);
    }

    quill.focus();

    props.onClose();
  }

  return (
    <QuillEmbedDialog 
      title={t('Link', { ns: 'annotation-common' })} 
      placeholder={t('Enter link', { ns: 'annotation-common' })}
      message={t('Type or paste a link to insert it into your annotation.', { ns: 'annotation-common' })}
      onSave={onSave}
      onCancel={props.onClose} />
  )

}

export const EmbedImageDialog = (props: QuillEmbedDialogProps) => {

  const { t } = useTranslation(['annotation-common']);

  const { quill } = useQuillEditor();

  const onSave = (url: string, range?: Range) => {
    if (!quill) return; // Should never happen

    const start = range?.index || quill.getLength();

    quill.insertEmbed(start, 'image', url, 'user');
    quill.insertEmbed(start + 1, 'block', '<br><p><br></p>');
    quill.setSelection({ index: start + 1, length: 0 });
    window.setTimeout(() => quill.focus(), 100);

    props.onClose();
  }

  return (
    <QuillEmbedDialog 
      icon={<Image size={24} />} 
      title={t('Image', { ns: 'annotation-common' })}
      message={t('Paste a publicly available URL to the image to insert it into your annotation.', { ns: 'annotation-common' })}
      placeholder={t('Image URL', { ns: 'annotation-common' })}
      onSave={onSave}
      onCancel={props.onClose}/>
  )

}

export const EmbedYouTubeDialog = (props: QuillEmbedDialogProps) => {

  const { t } = useTranslation(['annotation-common']);

  const { quill } = useQuillEditor();

  const onSave = (url: string, range?: Range) => {
    if (!quill) return; // Should never happen

    const vetted = parseYoutubeURL(url);
    if (vetted) {
      const start = range?.index || quill.getLength();

      quill.insertEmbed(start, 'video', vetted);
      quill.insertEmbed(start + 1, 'block', '<br><p><br></p>');
      quill.setSelection({ index: start + 1, length: 0 });
      quill.focus();
    }

    props.onClose();
  }

  return (
    <QuillEmbedDialog 
      icon={<Video size={24} />} 
      title={t('YouTube Video', { ns: 'annotation-common' })}
      message={t('Paste a YouTube URL to embed the video into your annotation.', { ns: 'annotation-common' })}
      placeholder={t('YouTube URL', { ns: 'annotation-common' })}
      onSave={onSave} 
      onCancel={props.onClose} />
  )

}

const QuillEmbedDialog = (props: EmbedDialogProps) => {

  const [value, setValue] = useState('');

  const { quill } = useQuillEditor();

  const selection = useMemo(() => quill?.getSelection(), [quill]);

  const { t } = useTranslation(['common']);

  const onCancel = () => {
    props.onCancel();
    window.setTimeout(() => quill?.focus(), 1);
  }

  return (
    <Dialog.Root open={true}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay not-annotatable" />
        
        <DialogContent className="dialog-content not-annotatable quill-embed-dialog">
          <Dialog.Title className='dialog-title'>
            {props.icon} {props.title}
          </Dialog.Title>
          
          {props.message && (
            <Dialog.Description className='dialog-description'>
              {props.message}
            </Dialog.Description>
          )}

          <input
            placeholder={props.placeholder}
            onChange={e => setValue(e.target.value)} />

          <div className="embed-dialog-actions">
            <button 
              onClick={onCancel}>
              {t('Cancel', { ns: 'common' })}
            </button>

            <button 
              className="primary"
              onClick={() => props.onSave(value, selection)}>
              {t('Save', { ns: 'common' })}
            </button>
          </div>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )

}