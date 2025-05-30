import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useExtensions } from '@recogito/studio-sdk';
import { useAnnotatorUser } from '@annotorious/react';
import { animated, easings, useTransition } from '@react-spring/web';
import type { AnnotationBody, Color, PresentUser, User } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { ExtensionMount } from '@components/Plugins';
import { AnnotationCardSection } from './AnnotationCardSection';
import { EmptyAnnotation } from './EmptyAnnotation';
import { Interstitial } from './Interstitial';
import { ReplyField } from './ReplyField';
import type { Layer, Policies, Translations, VocabularyTerm } from 'src/Types';

import './AnnotationCard.css';

export interface AnnotationCardProps {

  annotation: SupabaseAnnotation;

  autoFocus?: boolean;

  borderColor?: Color;

  i18n: Translations;

  isNote?: boolean;

  isProjectLocked?: boolean;

  isReadOnly?: boolean;

  isSelected?: boolean;

  layers?: Layer[];

  layerNames: Map<string, string>;
  
  present: PresentUser[];

  policies?: Policies;

  showReplyField?: boolean;

  tagVocabulary?: VocabularyTerm[];

  onDeleteAnnotation(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onNavigateTo(annotationId: string): void;

  onSubmit(): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

/**
 * Per convention, we only support tags created along with the first comment.
 * But they could be anywhere in the ordered list of bodies, because the
 * creator (or an admin user) might have added them later, when editing the initial comment.
 */
const getTags = (annotation: SupabaseAnnotation) =>
  annotation.bodies.filter(b => b.purpose === 'tagging');

export const AnnotationCard = (props: AnnotationCardProps) => {

  const { annotation } = props;

  const el = useRef<HTMLDivElement>(null);

  const borderStyle = props.borderColor ? 
    { '--card-border': props.borderColor } as React.CSSProperties : undefined;

  const comments = annotation.bodies
    .filter(b => !b.purpose || b.purpose === 'commenting' || b.purpose === 'replying')
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

  // If this is my annotation and has no bodies on mount, it's a new annotation
  const [isNew, setIsNew] = useState(annotation.bodies.length === 0);

  // Update isNew when annotation changes
  useEffect(() => setIsNew(annotation.bodies.length === 0), [annotation.id, props.isSelected]);

  const isPrivate = annotation.visibility === Visibility.PRIVATE;

  const [shouldAnimate, setShouldAnimate] = useState(false);

  const extensions = useExtensions('annotation:*:annotation-editor');

  const interstitialTtransition = useTransition(isCollapsed ? 
    [] : comments.slice(1, comments.length - 1), {
      from: { maxHeight: '0vh' },
      enter: { maxHeight: '40vh' },
      leave: { maxHeight: '0vh' },
      config: { 
        duration: shouldAnimate ? 350 : 0,
        easing: easings.easeInOutCubic 
      }
    }
  );

  const replyFieldTransition = useTransition([props.showReplyField], {
    from: { maxHeight: '0px' },
    enter: { maxHeight: `${document.documentElement.clientHeight * 0.3 + 80}px` },
    leave: { maxHeight: '0px' },
    config: { 
      duration: 300,
      easing: easings.easeOutCubic
    }
  });

  const onSubmit = () => {
    if (typeof (document as any).startViewTransition === 'function') {
      document.startViewTransition(() => flushSync(() => setIsNew(false)));
    } else {
      setIsNew(false);
    }

    props.onSubmit();
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

  const onReply = (b: AnnotationBody) => {
    props.onCreateBody(b);
    props.onSubmit();
  }

  useEffect(() => {
    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map(b => b.id));

    if (comments.length > 0) setIsNew(false);

    //...and remove 'is-new' CSS class instantly for fading effect
    setTimeout(() => {
      document
        .querySelectorAll('.is-new')
        .forEach((el) => el.classList.remove('is-new'));
    }, 200);
  }, [comments.map(c => c.id).join(',')]);

  useEffect(() => {
    if (props.isSelected) {
      setTimeout(() => {
        el.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });  
      }, 1);
    } else {
      setShouldCollapse(true);
    }
  }, [props.isSelected]);

  useEffect(() => {
    // Enable animation after initial render
    setTimeout(() => setShouldAnimate(true), 1);
  }, []);

  const className = [
    'annotation not-annotatable',
    props.isSelected ? 'selected' : undefined,
    props.isNote ? 'note' : undefined,
    isPrivate ? 'private' : undefined,
    props.isReadOnly ? 'readonly' : undefined
  ].filter(Boolean).join(' ');

  return (
    <div ref={el}>
      {!props.isProjectLocked && isNew ? (
        <EmptyAnnotation 
          annotation={annotation} 
          autoFocus={props.autoFocus}
          i18n={props.i18n}
          isSelected={props.isSelected}
          me={me} 
          present={props.present}
          tagVocabulary={props.tagVocabulary}
          onBulkDeleteBodies={props.onBulkDeleteBodies}
          onCreateBody={props.onCreateBody} 
          onDeleteAnnotation={props.onDeleteAnnotation}
          onDeleteBody={props.onDeleteBody}
          onMakePublic={onMakePublic} 
          onNavigateTo={props.onNavigateTo}
          onSubmit={onSubmit}
          onUpdateAnnotation={props.onUpdateAnnotation} 
          onUpdateBody={props.onUpdateBody} />  
      ) : (
        <div style={borderStyle} className={className}>
          <ul>
            <li>
              <AnnotationCardSection
                annotation={annotation}
                comment={comments[0]}
                tags={tags}
                i18n={props.i18n}
                index={0}
                isPrivate={isPrivate}
                isProjectLocked={props.isProjectLocked}
                isReadOnly={props.isReadOnly}
                isSelected={props.isSelected}
                layerNames={props.layerNames}
                me={me}
                policies={props.policies}
                present={props.present}
                tagVocabulary={props.tagVocabulary}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onCreateBody={props.onCreateBody}
                onDeleteBody={props.onDeleteBody}
                onBulkDeleteBodies={props.onBulkDeleteBodies}
                onMakePublic={() => onMakePublic()}
                onNavigateTo={props.onNavigateTo}
                onSubmit={onSubmit}
                onUpdateAnnotation={props.onUpdateAnnotation}
                onUpdateBody={props.onUpdateBody} />
            </li>

            {isCollapsed && (
              <li className="interstitial-wrapper">
                <Interstitial
                  i18n={props.i18n}
                  count={comments.length - 2}
                  onClick={() => setShouldCollapse(false)} />
              </li>
            )}

            {interstitialTtransition((style, comment, _, index) => (
              <animated.li
                key={comment.id}
                style={{
                  ...style,
                  overflow: 'hidden',
                  zIndex: comments.length - index - 1,
                }}>
                <AnnotationCardSection
                  annotation={annotation}
                  comment={comment}
                  emphasizeOnEntry={!dontEmphasise.current.has(comment.id)}
                  i18n={props.i18n}
                  index={index + 1}
                  isPrivate={isPrivate}
                  isProjectLocked={props.isProjectLocked}
                  isReadOnly={props.isReadOnly}
                  isSelected={props.isSelected}
                  layerNames={props.layerNames}
                  me={me}
                  policies={props.policies}
                  present={props.present}
                  tagVocabulary={props.tagVocabulary}
                  onDeleteAnnotation={props.onDeleteAnnotation}
                  onCreateBody={props.onCreateBody}
                  onDeleteBody={props.onDeleteBody}
                  onBulkDeleteBodies={props.onBulkDeleteBodies}
                  onMakePublic={() => onMakePublic()}
                  onNavigateTo={props.onNavigateTo}
                  onSubmit={props.onSubmit}
                  onUpdateAnnotation={props.onUpdateAnnotation}
                  onUpdateBody={props.onUpdateBody} />
              </animated.li>
            ))}

            {comments.length > 1 && (
              <li style={{ zIndex: 1 }}>
                <AnnotationCardSection
                  annotation={annotation}
                  comment={comments[comments.length - 1]}
                  emphasizeOnEntry={!dontEmphasise.current.has(
                    comments[comments.length - 1].id
                  )}
                  i18n={props.i18n}
                  index={comments.length - 1}
                  isPrivate={isPrivate}
                  isProjectLocked={props.isProjectLocked}
                  isReadOnly={props.isReadOnly}
                  isSelected={props.isSelected}
                  layerNames={props.layerNames}
                  me={me}
                  policies={props.policies}
                  present={props.present}
                  tagVocabulary={props.tagVocabulary}
                  onDeleteAnnotation={props.onDeleteAnnotation}
                  onCreateBody={props.onCreateBody}
                  onDeleteBody={props.onDeleteBody}
                  onBulkDeleteBodies={props.onBulkDeleteBodies}
                  onMakePublic={() => onMakePublic()}
                  onNavigateTo={props.onNavigateTo}
                  onSubmit={props.onSubmit}
                  onUpdateAnnotation={props.onUpdateAnnotation}
                  onUpdateBody={props.onUpdateBody} />
              </li>
            )}
          </ul>

          {extensions.map(({ extension, config }) => (
            <ExtensionMount
              key={extension.name}
              extension={extension}
              pluginConfig={config}
              annotation={props.annotation}
              isReadOnly={props.isReadOnly}
              isSelected={props.isSelected}
              layers={props.layers}
              me={me}
              onUpdateAnnotation={props.onUpdateAnnotation}
            />
          ))}

          {!props.isProjectLocked && (replyFieldTransition((style, open) => open && (
            <animated.div style={style}>
              <ReplyField
                autoFocus
                i18n={props.i18n}
                isPrivate={isPrivate}
                annotation={props.annotation}
                me={me}
                placeholder={props.i18n.t['Reply']}
                beforeSubmit={beforeReply} 
                onNavigateTo={props.onNavigateTo}
                onSubmit={onReply} />
            </animated.div>
          )))}
        </div>
      )}
    </div>
  )
}