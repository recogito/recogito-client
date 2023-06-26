import { Detective } from '@phosphor-icons/react';
import { useAnnotationStore } from '@annotorious/react';
import { TimeAgo } from '@components/TimeAgo';
import { PrivateCommentActions } from './PrivateCommentActions';
import type { CommentProps } from '../CommentProps';

import '../Comment.css';
import './PrivateComment.css';

type PrivateCommentProps = CommentProps & {

  onMakePublic(): void;

}

export const PrivateComment = (props: PrivateCommentProps) => {

  const { comment } = props;

  const store = useAnnotationStore();

  const onDeleteComment = () => store.deleteBody(comment);

  return (
    <article
      key={comment.id}
      className="annotation-comment private">
      <Detective className="anonymous" size={20} weight="light" />
      
      <div className="comment-body">
        {comment.created && (
          <TimeAgo datetime={comment.created} locale={props.i18n.lang} />
        )}
        <p>{comment.value}</p>
      </div>

      <PrivateCommentActions 
        i18n={props.i18n}
        isFirst={props.index === 0}
        onMakePublic={props.onMakePublic}
        onDeleteAnnotation={props.onDeleteAnnotation}
        onDeleteComment={onDeleteComment} />
    </article>
  )

}