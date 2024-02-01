import { useLayoutEffect, useRef, useState } from 'react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { DesktopReplyForm } from './DesktopReplyForm';
import { MobileReplyForm } from './MobileReplyForm';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

interface ReplyFormProps {

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

  const el = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<'desktop' | 'mobile' | undefined>();
  
  useLayoutEffect(() => {
    if (window.innerHeight < 512)
      setMode('mobile');
    else
      setMode('desktop');
  }, []);

  return (
    <div ref={el}>
      {mode === 'desktop' ? (
        <DesktopReplyForm {...props} />
      ) : (
        <MobileReplyForm />
      )}
    </div>
  );
};
