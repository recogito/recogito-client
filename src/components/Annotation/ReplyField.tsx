import { ArrowRight } from '@phosphor-icons/react';
import { QuillEditor, QuillEditorRoot, QuillEditorToolbar } from '@components/QuillEditor';

import './ReplyField.css';

interface ReplyFieldProps {

}

export const ReplyField = (props: ReplyFieldProps) => {

  return (
    <div className="reply-field">
      <QuillEditorRoot>
        <div className="annotation-header">
          {/* <Avatar /> */}
          <div className="annotation-toolbar-wrapper">
            <QuillEditorToolbar />
          </div>
        </div>

        <div className="reply-field-wrapper">
          <QuillEditor 
            placeholder="Add a reply" />

          <button className="save save-arrow">
            <ArrowRight size={20} />
          </button>
        </div>
      </QuillEditorRoot>
    </div>
  )

}