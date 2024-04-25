import React, { useEffect, useRef, useState } from 'react';
import { RichTextEditor } from '@components/RichTextEditor';
import TextareaAutosize from 'react-textarea-autosize';
import type { AnnotationBody } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { MobileTextarea, useMobileFallback } from '../MobileTextarea';import type { Delta } from 'quill/core';
;

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

  const { useMobile, onBlur, onClose, onFocus } = useMobileFallback();

  const format = comment.value && comment.value.length > 0 && comment.value.charAt(0) === '{'
    ? 'Quill': 'TextPlain';

  const [value, setValue] = useState<string | DeltaStatic | undefined>(
    format === 'Quill'
      ? JSON.parse(comment.value!)
      : comment.value
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
        current.value = comment.value || '';
      }, 1);
    }
  }, [editable]);

  const onSave = (value: Delta) => {
    const format = typeof value === 'string' ? 'TextPlain' : 'Quill';
    
    const next = {
      ...comment,
      format,
      value: format === 'TextPlain' ? (value as string) : JSON.stringify(value)
    };

    setValue(value);
    
    props.onChange(comment, next);
  }

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();
    if (value)
      onSave(value);
  }

  const onCancelChange = () => {
    props.onCanceled();
    setValue(JSON.parse(comment.value!));
    onClose();
  };

  return editable ? useMobile ? (
    <MobileTextarea
      i18n={props.i18n}
      value={value}
      placeholder="placeholder..."
      onSave={onSave}  
      onCancel={onCancelChange} />
  ) : (
    <form>
      {format === 'TextPlain' ? (
        <TextareaAutosize
          className='no-drag'
          ref={textarea}
          value={value as string}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(evt) => setValue(evt.target.value)}
          rows={1}
          maxRows={10}
        />
      ) : (
        <RichTextEditor
          value={value}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={setValue}
          editable={true}
          i18n={props.i18n}
        />
      )}
      <div className='buttons'>
        <button
          disabled={value === comment.value}
          className='primary sm flat'
          type='button'
          onClick={onSubmit}
        >
          {t['Save']}
        </button>

        <button className='sm flat' type='button' onClick={onCancelChange}>
          {t['Cancel']}
        </button>
      </div>
    </form>
  ) : format === 'TextPlain' ? (
    <p className='no-drag'>{comment.value}</p>
  ) : (
    <RichTextEditor
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      onChange={setValue}
      editable={false}
      i18n={props.i18n}
    />
  );
};
