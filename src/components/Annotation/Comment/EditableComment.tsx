import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { AnnotationBody, useAnnotationStore } from '@annotorious/react';
import type { Translations } from 'src/Types';

interface EditableCommentProps {

  i18n: Translations;

  editable: boolean;

  comment: AnnotationBody;

  onChanged(): void;

  onCanceled(): void;

}

export const EditableComment = (props: EditableCommentProps) => {

  const { comment, editable } = props;

  const store = useAnnotationStore();

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState(comment);

  useEffect(() => {
    const { current } = textarea;

    if (editable && current) {
      // Put this in the event queue, so that 
      // Radix trigger focus happens first, textarea
      // focus second
      setTimeout(() => {
        current?.focus({ preventScroll: true });

        // This trick sets the cursor to the end of the text
        current.value = '';
        current.value = comment.value;
      }, 1);
    }
  }, [editable]);

  const onSaveChange = (evt: React.FormEvent) => {
    evt.preventDefault();

    store.updateBody(comment, {
      ...comment,
      value: textarea.current!.value
    });

    props.onChanged();
  }

  const onCancelChange = () => {
    props.onCanceled();
    setValue(comment.value);
  }

  return editable ? (
    <form onSubmit={onSaveChange}>
      <TextareaAutosize 
        className="no-drag"
        ref={textarea}
        value={value}
        onChange={evt => setValue(evt.target.value)}
        rows={1} 
        maxRows={10} />

      <div className="buttons">
        <button 
          disabled={value === comment.value}
          className="primary sm flat"
          type="submit">Save</button>

        <button 
          className="sm flat"
          type="button"
          onClick={onCancelChange}>Cancel</button>
      </div>
    </form>
  ) : (
    <p className="no-drag">{comment.value}</p>
  )

}