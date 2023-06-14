import { useState } from 'react';
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

  noBorder?: boolean;

  present: PresentUser[];

}

const Comment = (props: CommentProps) => {

  const { comment, noBorder, present } = props;

  return (
    <li 
      className={noBorder ? 'annotation-card-comment no-border' : 'annotation-card-comment'}
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
            comment={comments[comments.length - 1]}
            present={props.present} />
        </ul>
      ) : (
        <ul className="annotation-card-comments-container">
          {comments.map(comment => (
            <Comment
              key={comment.id}
              comment={comment}
              present={props.present} />
          ))}
        </ul>
      )}

      <ReplyForm {...props}  />
    </>
  )

}