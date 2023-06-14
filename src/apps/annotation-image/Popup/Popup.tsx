import { useEffect, useRef } from 'react';
import { Annotation } from '@components/Annotation';
import type { 
  AnnotationBody,
  AnnotationTarget,
  OpenSeadragonPopupProps,
  PresentUser
} from '@annotorious/react';

import './Popup.css';

type PopupProps = OpenSeadragonPopupProps & {

  present: PresentUser[];

}

export const Popup = (props: PopupProps) => {

  // Popup only supports a single selected annotation for now
  const selected = props.selection[0];

  const comments = selected.bodies
    .filter(b => !b.purpose || b.purpose === 'commenting');

  // Keep a list of comments that should not be animated on render,
  // either because they were already in the annotation, or they 
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when the list changes.
  const dontEmphasise = useRef(new Set(comments.map(b => b.id))); 

  useEffect(() => {
    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map(b => b.id));

    // ...and remove is-new class instantly for fading effect
    setTimeout(() => {
      document.querySelectorAll('.is-new')
        .forEach(el => el.removeAttribute('class'));
    }, 1);
  }, [comments]);

  // When the user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from other users
  const onBeforeReply = (b: AnnotationBody) =>
    dontEmphasise.current = new Set([...dontEmphasise.current, b.id]);

  // We want to show full presence information if the creator
  // of this body happens to be present (even if the creator 
  // is anonymous).
  const getCreator = (body: AnnotationBody | AnnotationTarget) => {
    const present = props.present.find(p => p.id === body.creator?.id);
    return present || body.creator;
  }

  return (
    <article className="annotation-popup ia-annotation-popup">
      <Annotation.Card annotation={selected} />
    </article>
  )
  
  /*
  return (
    <article className="annotation-popup ia-annotation-popup">
      {comments.length === 0 ? (
        <header>
          <Annotation.BodyHeader 
            creator={getCreator(selected.target)} 
            createdAt={selected.target.created} />
        </header>
      ) : (
        <ul>
          {comments.map((comment, index) => (
            <li 
              key={comment.id} 
              className={dontEmphasise.current.has(comment.id) ? undefined : 'is-new'}>

              <Annotation.BodyHeader  
                creator={getCreator(comment)} 
                createdAt={comment.created} />

              {* comment.creator?.id === me.id && (
                <CommentActionsMenu onDelete={index === 0 ? onDeleteAnnotation : onDeleteComment(comment)} />
              ) *}

              <p>{comment.value}</p>
            </li>
          ))}
        </ul>
      )}

      <Annotation.ReplyForm 
        annotation={selected} 
        beforeSubmit={onBeforeReply} />
    </article>
  )
  */

}