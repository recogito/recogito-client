import { useState } from 'react';
import { Detective } from '@phosphor-icons/react';
import type { AnnotationBody } from '@annotorious/react';
import { TimeAgo } from '@components/TimeAgo';
import { PrivateCommentActions } from './PrivateCommentActions';
import { EditableComment } from '../EditableComment';
import type { CommentProps } from '../CommentProps';

import '../Comment.css';
import './PrivateComment.css';

type PrivateCommentProps = CommentProps & {

  onMakePublic(): void;

}

export const PrivateComment = (props: PrivateCommentProps) => {

  const { comment } = props;

  const [editable, setEditable] = useState(false);

  const onChange = (oldValue: AnnotationBody, newValue: AnnotationBody) => {
    props.onUpdateBody(oldValue, newValue);
    setEditable(false)
  }

  return (
    <article
      key={comment.id}
      className="annotation-comment private">
      <Detective className="anonymous" size={20} weight="light" />
      
      <div className="comment-body">
        {comment.created && (
          <TimeAgo datetime={comment.created} locale={props.i18n.lang} />
        )}
        
        <EditableComment 
          i18n={props.i18n}
          editable={editable}
          comment={comment} 
          onChange={onChange} 
          onCanceled={() => setEditable(false)} />
      </div>

      <PrivateCommentActions 
        i18n={props.i18n}
        isFirst={props.index === 0}
        onMakePublic={props.onMakePublic}
        onEditComment={() => setEditable(true)}
        onDeleteAnnotation={props.onDeleteAnnotation}
        onDeleteComment={props.onDeleteAnnotation} />
    </article>
  )

}