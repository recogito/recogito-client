import { useEffect, useRef, useState } from 'react';
import type { AnnotationBody, PresentUser } from '@annotorious/react';
import type { CardProps } from '../Card';
import { BodyHeader } from '../../BodyHeader';
import { ReplyForm } from '../../ReplyForm';
import { Interstitial } from '../../Interstitial';

const getCreator = (present: PresentUser[], body: AnnotationBody) => {
  const presentMe = present.find(p => p.id === body.creator?.id);
  return presentMe || body.creator;
}

interface CommentProps {

  comment: AnnotationBody;

  isNew?: boolean;

  noBorder?: boolean;

  present: PresentUser[];

}

const Comment = (props: CommentProps) => {

  const { comment, isNew, noBorder, present } = props;

  const classes = ['annotation-card-comment'];
  
  if (isNew)
    classes.push('is-new');

  if (noBorder)
    classes.push('no-border');

  const className = `annotation-card-comment ${isNew ? 'is-new' : ''} ${noBorder ? 'no-border' : ''}`.trim();

  console.log('applying classes:', className);
  
  return (
    <li 
      className={className}
      key={comment.id}>

      <BodyHeader  
        creator={getCreator(present, comment)} 
        createdAt={comment.created} />

      <p>{comment.value}</p>
    </li>
  )

}

export const Default = (props: CardProps) => {

  const { annotation } = props;

  const [collapsed, setCollapsed] = useState(true);

  const comments = annotation.bodies
    .filter(b => !b.purpose || b.purpose === 'commenting');

  // Keep a list of comments that should not be color-highlighted 
  // on render, either because they were already in the annotation, or they 
  // are new additions created by the current user. We're using a
  // ref, because we don't want to re-render when this list changes.
  const dontEmphasise = useRef(new Set(comments.map(b => b.id))); 

  useEffect(() => {
    // Update the ref after comments have rendered...
    dontEmphasise.current = new Set(comments.map(b => b.id));

    // ...and remove 'is-new' CSS class instantly for fading effect
    setTimeout(() => {
      document.querySelectorAll('.is-new')
        .forEach(el => el.classList.remove('is-new'));
    }, 1);
  }, [comments]);

  // When this user creates a reply, add the comment to the list,
  // so it doesn't get emphasised like additions from the other users
  const onBeforeReply = (b: AnnotationBody) =>
    dontEmphasise.current = new Set([...dontEmphasise.current, b.id]);

  return (
    <>
      {collapsed && comments.length > 3 ? (
        <ul className="annotation-card-comments-container">
          <Comment
            noBorder
            comment={comments[0]}
            present={props.present} />

          <Interstitial 
            label={`Show ${comments.length - 2} more replies`} 
            onClick={() => setCollapsed(false)} />

          <Comment
            isNew={!dontEmphasise.current.has(comments[comments.length - 1].id)}
            comment={comments[comments.length - 1]}
            present={props.present} />
        </ul>
      ) : (
        <ul className="annotation-card-comments-container">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              isNew={!dontEmphasise.current.has(comment.id)}
              comment={comment}
              present={props.present} />
          ))}
        </ul>
      )}

      <ReplyForm 
        {...props}  
        beforeSubmit={onBeforeReply} />
    </>
  )

}