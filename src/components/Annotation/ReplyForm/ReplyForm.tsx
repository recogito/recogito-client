import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, Detective } from '@phosphor-icons/react';
import { useAnnotationStore } from '@annotorious/react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Visibility, SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { Avatar } from '../../Avatar';
import { RichTextEditor } from '@components/RichTextEditor';

import './ReplyForm.css';
import type { Translations } from 'src/Types';

export interface ReplyFormProps {
  annotation: SupabaseAnnotation;

  autofocus?: boolean;

  scrollIntoView?: boolean;

  placeholder: string;

  me: PresentUser | User;

  beforeSubmit?(body: AnnotationBody): void;

  onSubmit?(body: AnnotationBody): void;

  i18n: Translations;
}

export const ReplyForm = (props: ReplyFormProps) => {
  const { me } = props;

  const [value, setValue] = useState<string | undefined>();

  const textarea = useRef<HTMLTextAreaElement>(null);

  const store = useAnnotationStore();

  const isPublic = props.annotation.visibility !== Visibility.PRIVATE;

  useEffect(() => {
    if (props.scrollIntoView)
      textarea.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (textarea.current && props.autofocus)
      setTimeout(() => textarea.current?.focus({ preventScroll: true }), 1);
  }, [props.autofocus]);

  const onSubmit = (evt?: React.MouseEvent) => {
    evt?.preventDefault();

    if (value) {
      const body: AnnotationBody = {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: me.id,
          name: me.name,
          avatar: me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        value: JSON.stringify(value),
        format: 'Quill'
      };

      setValue('');

      props.beforeSubmit && props.beforeSubmit(body);

      store.addBody(body);

      props.onSubmit && props.onSubmit(body);
    }
  };

  return (
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
        initialValue={''}
        value={value || ''}
        // @ts-ignore
        onChange={setValue}
        editable={true}
        i18n={props.i18n}
      />
      <button className='send icon-only' onClick={onSubmit}>
        <ArrowRight size={18} />
      </button>
    </form>
  );
};
