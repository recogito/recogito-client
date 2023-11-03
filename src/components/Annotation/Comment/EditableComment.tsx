import React, { useEffect, useRef, useState } from 'react';
import { RichTextEditor } from '@components/RichTextEditor';
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
  const { t } = props.i18n;

  const { comment, editable } = props;

  const store = useAnnotationStore();

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [value, setValue] = useState<string | undefined>(
    // Hack for now
    comment.value.length > 0 && comment.value.charAt(0) === '{'
      ? JSON.parse(comment.value)
      : comment.value
  );
  const [renderType, setRenderType] = useState<'text' | 'quill'>('text');

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

  useEffect(() => {
    if (comment.value && comment.value.length > 0) {
      if (comment.value.charAt(0) === '{') {
        setRenderType('quill');
      } else {
        setRenderType('text');
      }
    }
  }, []);

  const onSaveChange = (evt: React.FormEvent) => {
    evt.preventDefault();

    store.updateBody(comment, {
      ...comment,
      render_type: renderType,
      value: renderType === 'text' ? (value as string) : JSON.stringify(value),
    });

    props.onChanged();
  };

  const onCancelChange = () => {
    props.onCanceled();
    setValue(JSON.parse(comment.value));
  };

  return editable ? (
    <form onSubmit={onSaveChange}>
      {renderType === 'text' ? (
        <TextareaAutosize
          className='no-drag'
          ref={textarea}
          value={value}
          onChange={(evt) => setValue(evt.target.value)}
          rows={1}
          maxRows={10}
        />
      ) : (
        <RichTextEditor
          initialValue={JSON.parse(comment.value)}
          value={value}
          // @ts-ignore
          onChange={setValue}
          editable={true}
          i18n={props.i18n}
        />
      )}
      <div className='buttons'>
        <button
          disabled={value === comment.value}
          className='primary sm flat'
          type='submit'
        >
          {t['Save']}
        </button>

        <button className='sm flat' type='button' onClick={onCancelChange}>
          {t['Cancel']}
        </button>
      </div>
    </form>
  ) : renderType === 'text' ? (
    <p className='no-drag'>{comment.value}</p>
  ) : (
    <RichTextEditor
      initialValue={JSON.parse(comment.value)}
      value={value || ''}
      // @ts-ignore
      onChange={setValue}
      editable={false}
      i18n={props.i18n}
    />
  );
};
