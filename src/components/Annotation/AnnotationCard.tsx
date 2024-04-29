import { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAnnotatorUser } from '@annotorious/react';
import { animated, useTransition } from '@react-spring/web';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useAuthorColors } from '@components/AnnotationDesktop';
import { AnnotationCardSection } from './AnnotationCardSection';
import { Interstitial } from './Interstitial';
import { ReplyField } from './ReplyField';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCard.css';

export interface AnnotationCardProps {

  annotation: SupabaseAnnotation;

  i18n: Translations;

  isNote?: boolean;

  isReadOnly?: boolean;

  isSelected?: boolean;
  
  present: PresentUser[];

  policies?: Policies;

  showReplyField?: boolean;

  tagVocabulary?: string[];

  onReply(body: AnnotationBody): void;

  onDeleteAnnotation(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

/**
 * Per convention, we only support tags created along with the first comment.
 * This means:
 * - only the creator of the annotation can be the creator of tags,
 * - but they could be anywhere in the ordered list of bodies, because the
 *   creator might have added them later, while editing the initial comment.
 * 
 * Apply some basic sanity checking here! 
 */
const getTags = (annotation: SupabaseAnnotation) => {
  const creator = annotation.target.creator;

  const allTags = annotation
    .bodies.filter(b => b.purpose === 'tagging');

  const byCreator = allTags
    .filter(b => b.creator?.id === creator?.id);

  if (allTags.length !== byCreator.length)
    console.warn('Integrity warning: annotation has tags not created by annotation creator', annotation);

  return byCreator;
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


  const tags = getTags(annotation);

  // Keep a list of comments that should not be color-highlighted
  // on render, either because they were already in the annotation, or they
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when this list changes.
  const dontEmphasise = useRef(new Set(comments.map(b => b.id)));

  const [shouldCollapse, setShouldCollapse] = useState(true);
  
  const isCollapsed = shouldCollapse && comments.length > 3;

  const user = useAnnotatorUser();

  const me: PresentUser | User =
    props.present.find((p) => p.id === user.id) || user;

  const isPrivate = annotation.visibility === Visibility.PRIVATE;

  const transition = useTransition(isCollapsed ? 
    [] : comments.slice(1, comments.length - 1), {
      from: { maxHeight:'0vh' },
      enter: { maxHeight: '60vh' },
      leave: { maxHeight: '0vh' },
      config: { duration: 350 },
    }
  );

  const onCreateTag = (value: string) => {
    const tag: AnnotationBody = {
      id: uuidv4(),
      annotation: props.annotation.id,
      creator: {  
        id: me.id,
        name: me.name,
        avatar: me.avatar
      },
      created: new Date(),
      purpose: 'tagging',
      value
    };

    props.onCreateBody(tag);
  }

  const onMakePublic = () =>
    props.onUpdateAnnotation({
      ...annotation,
      visibility: undefined
    });

  // When this user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from the other users
  const beforeReply = (b: AnnotationBody) =>
    (dontEmphasise.current = new Set([...dontEmphasise.current, b.id]));

  const onReply = (b: AnnotationBody) =>
    props.onReply && props.onReply(b);

  useEffect(() => {
    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map(b => b.id));

    //...and remove 'is-new' CSS class instantly for fading effect
    setTimeout(() => {
      document
        .querySelectorAll('.is-new')
        .forEach((el) => el.classList.remove('is-new'));
    }, 200);
  }, [comments.map(c => c.id).join(',')]);

  useEffect(() => {
    if (!props.isSelected) setShouldCollapse(true);
  }, [props.isSelected]);

  const className = [
    'annotation not-annotatable',
    props.isSelected ? 'selected' : undefined,
    props.isNote ? 'note' : undefined,
    isPrivate ? 'private' : undefined,
    props.isReadOnly ? 'readonly' : undefined
  ].filter(Boolean).join(' ');

  // Annotation is not empty if it has a comment, tags or both
  const notEmpty = comments.length + tags.length > 0;

  return (
    <div style={borderStyle} className={className}>
      {notEmpty && (
        <ul>
          <li>
            <AnnotationCardSection
              comment={comments[0]}
              tags={tags}
              emphasizeOnEntry={!dontEmphasise.current.has(comments[0]?.id)}
              i18n={props.i18n}
              index={0}
              isPrivate={isPrivate}
              isReadOnly={props.isReadOnly}
              me={me}
              policies={props.policies}
              present={props.present}
              onDeleteAnnotation={props.onDeleteAnnotation}
              onCreateTag={onCreateTag}
              onDeleteBody={props.onDeleteBody}
              onBulkDeleteBodies={props.onBulkDeleteBodies}
              onMakePublic={() => onMakePublic()}
              onUpdateBody={props.onUpdateBody} />
          </li>

          {isCollapsed && (
            <li className="interstitial-wrapper">
              <Interstitial
                label={`Show ${comments.length - 2} more replies`}
                onClick={() => setShouldCollapse(false)} />
            </li>
          )}

          {transition((style, comment, _, index) => (
            <animated.li
              key={comment.id}
              style={{
                ...style,
                zIndex: comments.length - index - 1,
              }}>
              <AnnotationCardSection
                comment={comment}
                emphasizeOnEntry={!dontEmphasise.current.has(comment.id)}
                i18n={props.i18n}
                index={index + 1}
                isPrivate={isPrivate}
                isReadOnly={props.isReadOnly}
                me={me}
                policies={props.policies}
                present={props.present}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onCreateTag={onCreateTag}
                onDeleteBody={props.onDeleteBody}
                onBulkDeleteBodies={props.onBulkDeleteBodies}
                onMakePublic={() => onMakePublic()}
                onUpdateBody={props.onUpdateBody} />
            </animated.li>
          ))}

          {comments.length > 1 && (
            <li style={{ zIndex: 1 }}>
              <AnnotationCardSection
                comment={comments[comments.length - 1]}
                emphasizeOnEntry={!dontEmphasise.current.has(
                  comments[comments.length - 1].id
                )}
                i18n={props.i18n}
                index={comments.length - 1}
                isPrivate={isPrivate}
                isReadOnly={props.isReadOnly}
                me={me}
                policies={props.policies}
                present={props.present}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onCreateTag={onCreateTag}
                onDeleteBody={props.onDeleteBody}
                onBulkDeleteBodies={props.onBulkDeleteBodies}
                onMakePublic={() => onMakePublic()}
                onUpdateBody={props.onUpdateBody} />
            </li>
          )}
        </ul>
      )}

      {props.showReplyField && (
        <ReplyField 
          i18n={props.i18n}
          isPrivate={isPrivate}
          annotation={props.annotation}
          me={me}
          placeholder={props.i18n.t['Reply...']}
          beforeSubmit={beforeReply} 
          onSubmit={onReply} />
      )}
    </div>
  )

}