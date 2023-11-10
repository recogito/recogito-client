import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import type { AnnotationBody } from '@annotorious/react';
import type { Translations } from 'src/Types';

interface EditableCommentProps {

  i18n: Translations;

  editable: boolean;

  comment: AnnotationBody;

  onChange(oldValue: AnnotationBody, newValue: AnnotationBody): void;

  onCanceled(): void;

}

export const EditableComment = (props: EditableCommentProps) => {

  const { t } = props.i18n;

  const { comment, editable } = props;

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState(comment.value);

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
    props.onChange(comment, {
      ...comment,
      value: textarea.current!.value
    });
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
          type="submit">{t['Save']}</button>

        <button 
          className="sm flat"
          type="button"
          onClick={onCancelChange}>{t['Cancel']}</button>
      </div>
    </form>
  ) : (
    <p className="no-drag">{comment.value}</p>
  )

}