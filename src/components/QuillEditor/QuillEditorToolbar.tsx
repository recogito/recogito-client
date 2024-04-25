import { useEffect, useState } from 'react';
import { ArrowClockwise, ArrowCounterClockwise, Image, Link, Video } from '@phosphor-icons/react';

import { useQuillEditor } from './QuillEditorRoot';

export const QuillEditorToolbar = () => {

  const { quill } = useQuillEditor();

  const [canUndo, setCanUndo] = useState(false);

  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!quill) return;

    const onChange = () => {
      const { undo, redo }  = quill.history.stack;

      setCanUndo(undo.length > 0);
      setCanRedo(redo.length > 0);
    }

    quill.on('editor-change', onChange);

    return () => {
      quill.off('editor-change', onChange);
    }
  }, [quill]);

  return quill && (
    <div className="quill-rte-toolbar">
      <button 
        disabled={!canUndo}
        onClick={() => quill.history.undo()}>
        <ArrowCounterClockwise size={17} />
      </button>

      <button 
        disabled={!canRedo}
        onClick={() => quill.history.redo()}>
        <ArrowClockwise size={17} />
      </button>

      <button>
        <Link size={17} />
      </button>
      
      <button onClick={() => quill.insertEmbed(10, 'image', 'https://quilljs.com/images/cloud.png')}>
        <Image size={17} />
      </button>
      
      <button>
        <Video size={17} />
      </button>
    </div>
  )

}