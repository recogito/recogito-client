import { useEffect, useState } from 'react';
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  Image,
  Link,
  Video,
} from '@phosphor-icons/react';
import { useQuillEditor } from './QuillEditorRoot';
import {
  EmbedImageDialog,
  EmbedLinkDialog,
  EmbedYouTubeDialog,
} from './QuillEmbedDialog';
import { useTranslation } from 'react-i18next';

export const QuillEditorToolbar = () => {
  const { quill } = useQuillEditor();

  const { t } = useTranslation(['a11y']);

  const [canUndo, setCanUndo] = useState(false);

  const [canRedo, setCanRedo] = useState(false);

  const [showDialog, setShowDialog] = useState<
    'LINK' | 'IMAGE' | 'YOUTUBE' | undefined
  >();

  useEffect(() => {
    if (!quill) return;

    const onChange = () => {
      const { undo, redo } = quill.history.stack;

      setCanUndo(undo.length > 0);
      setCanRedo(redo.length > 0);
    };

    quill.on('editor-change', onChange);

    return () => {
      quill.off('editor-change', onChange);
    };
  }, [quill]);

  return (
    quill && (
      <>
        <div className='quill-rte-toolbar'>
          <button
            disabled={!canUndo}
            onClick={() => quill.history.undo()}
            aria-label={t('undo last action', { ns: 'a11y' })}
          >
            <ArrowCounterClockwise size={17} />
          </button>

          <button
            disabled={!canRedo}
            onClick={() => quill.history.redo()}
            aria-label={t('redo last action', { ns: 'a11y' })}
          >
            <ArrowClockwise size={17} />
          </button>

          <button
            onClick={() => setShowDialog('LINK')}
            aria-label={t('insert an html link', { ns: 'a11y' })}
          >
            <Link size={17} />
          </button>

          <button
            onClick={() => setShowDialog('IMAGE')}
            aria-label={t('insert an image', { ns: 'a11y' })}
          >
            <Image size={17} />
          </button>

          <button
            onClick={() => setShowDialog('YOUTUBE')}
            aria-label={t('insert a video', { ns: 'a11y' })}
          >
            <Video size={17} />
          </button>
        </div>

        {showDialog === 'LINK' ? (
          <EmbedLinkDialog
            onClose={() => setShowDialog(undefined)}
          />
        ) : showDialog === 'IMAGE' ? (
          <EmbedImageDialog
            onClose={() => setShowDialog(undefined)}
          />
        ) : showDialog === 'YOUTUBE' ? (
          <EmbedYouTubeDialog
            onClose={() => setShowDialog(undefined)}
          />
        ) : null}
      </>
    )
  );
};
