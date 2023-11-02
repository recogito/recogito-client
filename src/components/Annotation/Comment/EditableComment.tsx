import React, { useEffect, useRef, useState } from 'react';
//import { RichTextEditor } from '@components/RichTextEditor';
import { RichTextEditor } from '@components/RichTextEditor';
//import { RichTextEditorT } from '@components/RichTextEditorT';
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
    JSON.parse(comment.value)
  );

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
      value: JSON.stringify(value),
    });

    props.onChanged();
  };

  const onCancelChange = () => {
    props.onCanceled();
    setValue(JSON.parse(comment.value));
  };

  return editable ? (
    <form onSubmit={onSaveChange}>
      <RichTextEditor
        initialValue={JSON.parse(comment.value)}
        value={value}
        // @ts-ignore
        onChange={setValue}
        editable={true}
        i18n={props.i18n}
      />
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
