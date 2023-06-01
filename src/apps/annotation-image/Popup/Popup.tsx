import { useEffect, useRef } from 'react';
import { Annotation } from '@components/Annotation';
import { 
  AnnotationBody,
  OpenSeadragonPopupProps,
  useAnnotationStore,
  useAnnotatorUser
} from '@annotorious/react';

import './Popup.css';

export const Popup = (props: OpenSeadragonPopupProps) => {

  const me = useAnnotatorUser();

  const store = useAnnotationStore();

  // Popup only supports a single selected annotation for now
  const selected = props.selection[0];

  const { creator, created } = selected.target;

  const comments = selected.bodies
    .filter(b => !b.purpose || b.purpose === 'commenting');

  // Keep a list of comments that should not be animated on render,
  // either because they were already in the annotation, or they 
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when the list changes.
  const dontEmphasise = useRef(new Set(comments.map(b => b.id))); 

  useEffect(() => {
    // Update the ref after comments have rendered
    dontEmphasise.current = new Set(comments.map(b => b.id));
  }, [comments]);

  // When the user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from other users
  const onBeforeReply = (b: AnnotationBody) =>
    dontEmphasise.current = new Set([...dontEmphasise.current, b.id]);

  return (
    <article className="annotation-popup ia-annotation-popup">
      {comments.length === 0 ? (
        <header>
          <Annotation.BodyHeader creator={creator} createdAt={created} />
        </header>
      ) : (
        <ul>

        </ul>
      )}

      <Annotation.ReplyForm 
        annotation={selected} 
        beforeSubmit={onBeforeReply} />
    </article>
  )

}