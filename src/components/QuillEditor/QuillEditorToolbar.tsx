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
import type { Translations } from 'src/Types';

interface QuillEditorToolbarProps {
  i18n: Translations;
}

export const QuillEditorToolbar = (props: QuillEditorToolbarProps) => {
  const { quill } = useQuillEditor();

  const { t } = props.i18n;

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
            aria-label={t['undo last action']}
          >
            <ArrowCounterClockwise size={17} />
          </button>

          <button
            disabled={!canRedo}
            onClick={() => quill.history.redo()}
            aria-label={t['redo last action']}
          >
            <ArrowClockwise size={17} />
          </button>

          <button
            onClick={() => setShowDialog('LINK')}
            aria-label={t['insert an html link']}
          >
            <Link size={17} />
          </button>

          <button
            onClick={() => setShowDialog('IMAGE')}
            aria-label={t['insert an image']}
          >
            <Image size={17} />
          </button>

          <button
            onClick={() => setShowDialog('YOUTUBE')}
            aria-label={t['insert a video']}
          >
            <Video size={17} />
          </button>
        </div>

        {showDialog === 'LINK' ? (
          <EmbedLinkDialog
            i18n={props.i18n}
            onClose={() => setShowDialog(undefined)}
          />
        ) : showDialog === 'IMAGE' ? (
          <EmbedImageDialog
            i18n={props.i18n}
            onClose={() => setShowDialog(undefined)}
          />
        ) : showDialog === 'YOUTUBE' ? (
          <EmbedYouTubeDialog
            i18n={props.i18n}
            onClose={() => setShowDialog(undefined)}
          />
        ) : null}
      </>
    )
  );
};
