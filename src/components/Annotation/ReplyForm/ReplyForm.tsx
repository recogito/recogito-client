import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, Detective } from '@phosphor-icons/react';
import type { DeltaStatic } from 'quill';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import {
  Visibility,
  SupabaseAnnotation,
  SupabaseAnnotationBody,
} from '@recogito/annotorious-supabase';
import { RichTextEditor } from '@components/RichTextEditor';
import { Avatar } from '../../Avatar';
import { useMobileFallback, MobileTextarea } from '../MobileTextarea';
import type { Translations } from 'src/Types';

import './ReplyForm.css';

export interface ReplyFormProps {

  i18n: Translations;

  annotation: SupabaseAnnotation;

  autofocus?: boolean;

  scrollIntoView?: boolean;

  placeholder: string;

  me: PresentUser | User;

  beforeSubmit?(body: AnnotationBody): void;

  onSubmit(body: AnnotationBody): void;

}

export const ReplyForm = (props: ReplyFormProps) => {

  const { me } = props;

  const [value, setValue] = useState<string | DeltaStatic | undefined>();

  const textarea = useRef<HTMLTextAreaElement>(null);

  const isPublic = props.annotation.visibility !== Visibility.PRIVATE;

  const { useMobile, onBlur, onClose, onFocus } = useMobileFallback();

  useEffect(() => {
    if (props.scrollIntoView)
      textarea.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (textarea.current && props.autofocus)
      setTimeout(() => textarea.current?.focus({ preventScroll: true }), 1);
  }, [props.autofocus]);

  const onSave = (value: string | DeltaStatic) => {
    if (value) {
      const [format, stringified] = typeof value === 'string'  
        ? ['TextPlain', value as unknown as string]
        : ['Quill', JSON.stringify(value)];

      const body: SupabaseAnnotationBody = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: me.id,
          name: me.name,
          avatar: me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        format,
        value: stringified
      };

      setValue('');

      props.beforeSubmit && props.beforeSubmit(body);

      props.onSubmit && props.onSubmit(body);
    }
  };

  const onSubmitForm = (evt?: React.MouseEvent) => {
    evt?.preventDefault();
    if (value)
      onSave(value);
  }

  return useMobile ? (
    <MobileTextarea
      i18n={props.i18n}
      value={value}
      onSave={onSave}
      onCancel={onClose} />
  ) : (
    <form className='annotation-reply-form no-drag'>
      {isPublic ? (
        <Avatar
          id={me.id}
          name={me.name || (me as PresentUser).appearance?.label}
          avatar={me.avatar || (me as PresentUser).appearance?.avatar}
        />
      ) : (
        <Detective className='anonymous' size={20} weight='light' />
      )}

      <RichTextEditor
        value={value}
        editable={true}
        i18n={props.i18n}
        onChange={setValue}
        onFocus={onFocus}
        onBlur={onBlur} 
        placeholder={props.placeholder} />

      <button className='send icon-only' onClick={onSubmitForm}>
        <ArrowRight size={18} />
      </button>
    </form>
  );
};
