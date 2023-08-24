import { ReactNode, useEffect, useRef, useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import { useAnnotatorUser, useAnnotationStore } from '@annotorious/react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { CommentProps } from '../Comment/CommentProps';
import { Interstitial } from './Interstitial';
import { ReplyForm } from '../ReplyForm';
import { TagList } from '../TagList';
import type { CardProps } from './CardProps';

import './BaseCard.css';

type BaseCardProps = CardProps & {

  comment(props: CommentProps): ReactNode;

}

export const BaseCard = (props: BaseCardProps) => {

  const store = useAnnotationStore();

  const { annotation } = props;

  const comments = annotation.bodies
    .filter((b: AnnotationBody) => !b.purpose || b.purpose === 'commenting');

  // Keep a list of comments that should not be color-highlighted 
  // on render, either because they were already in the annotation, or they 
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when this list changes.
  const dontEmphasise = useRef(new Set(comments.map((b: AnnotationBody) => b.id))); 

  const [collapsed, setCollapsed] = useState(comments.length > 3);

  const [animate, setAnimate] = useState(false);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  // Shorthand for readability
  const isMine = (body: AnnotationBody) => me.id === body.creator?.id;

  const onDeleteAnnotation = () => 
    store.deleteAnnotation(props.annotation);

  const transition = useTransition(collapsed ? 
    [] : comments.slice(1, comments.length - 1), {
      from: { 
        maxHeight: animate ? '0vh' : '80vh' 
      },
      enter: { maxHeight: '80vh' },
      leave: { maxHeight: '0vh' },
      config: { duration: 350 }
    });

  useEffect(() => setAnimate(true), []);

  // When this user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from the other users
  const beforeReply = (b: AnnotationBody) =>
    dontEmphasise.current = new Set([...dontEmphasise.current, b.id]);

  useEffect(() => {
    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map((b: AnnotationBody) => b.id));

    // ...and remove 'is-new' CSS class instantly for fading effect
    setTimeout(() => {
      document.querySelectorAll('.is-new')
        .forEach(el => el.classList.remove('is-new'));
    }, 100);
  }, [comments]);

  return (
    <>
      <TagList 
        i18n={props.i18n}
        annotation={props.annotation} 
        me={me} />

      {comments.length > 0 && (
        <ul className="annotation-card-comments-container">
          <li 
            style={{ zIndex: comments.length + 1 }}>
            {props.comment({
              i18n: props.i18n,
              index: 0,
              comment: comments[0],
              present: props.present,
              emphasizeOnEntry: !dontEmphasise.current.has(comments[0].id),
              editable: isMine(comments[0]),
              onDeleteAnnotation
            })}
          </li>

          {collapsed && (
            <li style={{ zIndex: comments.length }}>
              <Interstitial 
                label={`Show ${comments.length - 2} more replies`} 
                onClick={() => setCollapsed(false)} />
            </li>
          )}

          {transition((style, item, _, index) => (
            <animated.li 
              style={{
                ...style,
                zIndex: comments.length - index - 1
              }}>

              {props.comment({
                i18n: props.i18n,
                index: index + 1,
                comment: item,
                present: props.present,
                emphasizeOnEntry: !dontEmphasise.current.has(item.id),
                editable: isMine(item),
                onDeleteAnnotation
              })}
            </animated.li>
          ))}

          {comments.length > 1 && (
            <li style={{ zIndex: 1 }}>
              {props.comment({
                i18n: props.i18n,
                index: comments.length - 1,
                comment: comments[comments.length - 1],
                present: props.present,
                emphasizeOnEntry: !dontEmphasise.current.has(comments[comments.length - 1].id),
                editable: isMine(comments[comments.length - 1]),
                onDeleteAnnotation
              })}
            </li>
          )}
        </ul>
      )}

      {props.showReplyForm && (
        <ReplyForm 
          autofocus
          annotation={props.annotation}
          me={me}
          placeholder={props.i18n.t['Reply...']}
          beforeSubmit={beforeReply} 
          onSubmit={props.onReply} />
      )}
    </>
  )

}