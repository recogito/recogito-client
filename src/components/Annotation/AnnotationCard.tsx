import { useEffect, useMemo, useRef, useState } from 'react';
import { useAnnotatorUser } from '@annotorious/react';
import { useTransition } from '@react-spring/web';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useAuthorColors } from '@components/AnnotationDesktop';
import { AnnotationCardSection } from './AnnotationCardSection';
import { Interstitial } from './Interstitial';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCard.css';

export interface AnnotationCardProps {

  annotation: SupabaseAnnotation;

  className?: string;

  i18n: Translations;

  isNote?: boolean;
  
  present: PresentUser[];

  policies?: Policies;

  showReplyForm?: boolean;

  tagVocabulary?: string[];

  onReply(body: AnnotationBody): void;

  onDeleteAnnotation(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

export const AnnotationCard = (props: AnnotationCardProps) => {

  const { annotation } = props;

  const colors = useAuthorColors();

  const borderStyle = useMemo(() => {
    const creator: PresentUser | User | undefined = 
      props.present.find(p => p.id === annotation.target.creator?.id) || annotation.target.creator;

    return { '--card-border': colors.getColor(creator) } as React.CSSProperties;
  }, [colors, annotation]);

  // const plugins = usePlugins('annotation.*.annotation-editor');

  const comments = annotation.bodies
    .filter(b => !b.purpose || b.purpose === 'commenting')
    .slice()
    .sort((a, b) => {
      if (!a.created || !b.created) return 0;
      return a.created.getTime() - b.created.getTime();
    });

  // Keep a list of comments that should not be color-highlighted
  // on render, either because they were already in the annotation, or they
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when this list changes.
  const dontEmphasise = useRef(new Set(comments.map(b => b.id)));

  const [collapse, setCollapse] = useState(comments.length > 3);

  const shouldAnimate = useRef(false);

  const user = useAnnotatorUser();

  const me: PresentUser | User =
    props.present.find((p) => p.id === user.id) || user;

  const isPrivate = annotation.visibility === Visibility.PRIVATE;

  const isMine = (body: AnnotationBody) => me.id === body.creator?.id;

  const transition = useTransition(collapse ? 
    [] : comments.slice(1, comments.length - 1), {
      from: { 
        maxHeight: shouldAnimate.current ? '0vh' : '80vh' 
      },
      enter: { maxHeight: '80vh' },
      leave: { maxHeight: '0vh' },
      config: { duration: shouldAnimate.current ? 350 : 0 },
    }
  );

  useEffect(() => { shouldAnimate.current = true; }, []);

  // When this user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from the other users
  const beforeReply = (b: AnnotationBody) =>
    (dontEmphasise.current = new Set([...dontEmphasise.current, b.id]));

  const onReply = (b: AnnotationBody) =>
    props.onReply && props.onReply(b);

  useEffect(() => {
    const eqSet = (x: Set<any>, y: Set<any>) =>
      x.size === y.size && [...x].every((x) => y.has(x));

    const commentIds = comments.map(c => c.id);

    if (eqSet(new Set(commentIds), dontEmphasise.current || new Set()))
      shouldAnimate.current = false;

    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map(b => b.id));

    // ...and remove 'is-new' CSS class instantly for fading effect
    setTimeout(() => {
      document
        .querySelectorAll('.is-new')
        .forEach((el) => el.classList.remove('is-new'));
    }, 100);
  }, [comments.map(c => c.id).join(',')]);

  const className = [
    'annotation',
    props.isNote ? 'note' : undefined,
    isPrivate ? 'private' : undefined,
    // props.isReadOnly ? 'readonly' : undefined
  ].filter(Boolean).join( );

  return (
    <div style={borderStyle} className={className}>
      {comments.length > 0 && (
        <ul>
          <li>
            <AnnotationCardSection
              allowEditing={isMine(comments[0])}
              comment={comments[0]}
              emphasizeOnEntry={!dontEmphasise.current.has(comments[0].id)}
              i18n={props.i18n}
              index={0}
              isPrivate={isPrivate}
              policies={props.policies}
              present={props.present}
              onDeleteAnnotation={props.onDeleteAnnotation}
              onCreateBody={props.onCreateBody}
              onDeleteBody={props.onDeleteBody}
              onUpdateBody={props.onUpdateBody} />
          </li>

          {collapse && (
            <li>
              <Interstitial
                label={`Show ${comments.length - 2} more replies`}
                onClick={() => setCollapse(false)} />
            </li>
          )}
        </ul>
      )}

      {/* props.showReplyField && !props.isReadOnly && (
        <ReplyField />
      ) */}
    </div>
  )

}