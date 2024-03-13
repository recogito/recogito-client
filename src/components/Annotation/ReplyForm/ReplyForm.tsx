import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { MobileFallback } from './MobileFallback';
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

const MIN_SCREEN_HEIGHT = 512;

export const ReplyForm = (props: ReplyFormProps) => {
  const { me } = props;

  const [value, setValue] = useState<string | DeltaStatic | undefined>();

  const [showMobileFallback, setShowMobileFallback] = useState(false);

  const textarea = useRef<HTMLTextAreaElement>(null);

  const isPublic = props.annotation.visibility !== Visibility.PRIVATE;

  const onResize = useCallback(() => {
    const h = window.visualViewport?.height || window.screen.height;
    setShowMobileFallback(h < MIN_SCREEN_HEIGHT);
  }, []);

  const onFocus = () => {
    onResize();
    window.visualViewport?.addEventListener('resize', onResize);
  }

  const onBlur = () => {
    window.visualViewport?.removeEventListener('resize', onResize);
  }

  useEffect(() => {
    if (props.scrollIntoView)
      textarea.current?.scrollIntoView({ behavior: 'smooth' });

    return () => {
      // Quill doesn't seem to fire onBlur reliably!
      window.removeEventListener('resize', onResize);
    }
  }, []);

  useEffect(() => {
    if (textarea.current && props.autofocus)
      setTimeout(() => textarea.current?.focus({ preventScroll: true }), 1);
  }, [props.autofocus]);

  const onCloseMobileFallback = () => {
    // Remove listener, otherwise it will re-open
    window.removeEventListener('resize', onResize);
    setShowMobileFallback(false);
  }

  const onSubmit = (evt?: React.MouseEvent) => {
    evt?.preventDefault();

    if (value) {
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
        value: JSON.stringify(value),
        format: 'Quill',
      };

      setValue('');

      props.beforeSubmit && props.beforeSubmit(body);

      props.onSubmit && props.onSubmit(body);
    }
  };

  return showMobileFallback ? (
    <MobileFallback 
      {...props} 
      onClose={onCloseMobileFallback} />
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
        initialValue={''}
        value={value || ''}
        editable={true}
        i18n={props.i18n}
        onChange={setValue}
        onFocus={onFocus}
        onBlur={onBlur} />

      <button className='send icon-only' onClick={onSubmit}>
        <ArrowRight size={18} />
      </button>
    </form>
  );
};
