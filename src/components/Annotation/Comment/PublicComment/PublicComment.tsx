import { useState } from 'react';
import { useAnnotationStore, useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import { Creator } from '../../Creator';
import type { CommentProps } from '../CommentProps';
import { EditableComment } from '../EditableComment';
import { PublicCommentActions } from './PublicCommentActions';

import '../Comment.css';

export const PublicComment = (props: CommentProps) => {

  const { comment, present } = props;

  const me = useAnnotatorUser();

  const store = useAnnotationStore();

  const [editable, setEditable] = useState(false);

  const creator: PresentUser | User | undefined = 
    present.find(p => p.id === comment.creator?.id) || comment.creator;

  const isMine = creator?.id === me.id;

  const onDeleteComment = () => store.deleteBody(comment);

  return (
    <article
      key={comment.id} 
      className={props.emphasizeOnEntry ? 
      'annotation-comment public is-new' : 'annotation-comment public'}>
        
      <Creator  
        i18n={props.i18n}
        creator={creator} 
        createdAt={comment.created} />

      <EditableComment 
        editable={editable}
        i18n={props.i18n} 
        comment={comment} 
        onChanged={() => setEditable(false)} 
        onCanceled={() => setEditable(false)} />

      {isMine && (
        <PublicCommentActions 
          i18n={props.i18n}
          isFirst={props.index === 0}
          onDeleteAnnotation={props.onDeleteAnnotation}
          onDeleteComment={onDeleteComment}
          onEditComment={() => setEditable(true)} />
      )}
    </article>
  )

}
