import { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useAnnotationStore, useAnnotatorUser } from '@annotorious/react';
import type { PresentUser, User } from '@annotorious/react';
import { Creator } from '../../Creator';
import type { CommentProps } from '../CommentProps';
import { PublicCommentActions } from './PublicCommentActions';

import '../Comment.css';

export const PublicComment = (props: CommentProps) => {

  const { comment, present } = props;

  const textarea = useRef<HTMLTextAreaElement>(null);

  const [editable, setEditable] = useState(false);

  const me = useAnnotatorUser();

  const store = useAnnotationStore();

  const creator: PresentUser | User | undefined = 
    present.find(p => p.id === comment.creator?.id) || comment.creator;

  const isMine = creator?.id === me.id;

  useEffect(() => {
    const { current } = textarea;

    if (editable && current) {
      // Put this in the event queue, so that 
      // Radix trigger focus happens first, textarea
      // focus second
      setTimeout(() => {
        current?.focus({ preventScroll: true });

        // This trick sets the cursor to the end of the text
        current.value = '';
        current.value = comment.value;
      }, 1);
    }
  }, [editable]);

  const onSaveChange = (evt: React.FormEvent) => {
    evt.preventDefault();

    props.onUpdateComment(comment, {
      ...comment,
      value: textarea.current!.value
    });

    setEditable(false);
  }

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

      {editable ? (
        <form onSubmit={onSaveChange}>
          <TextareaAutosize 
            className="no-drag"
            ref={textarea}
            defaultValue={comment.value}
            rows={1} 
            maxRows={10} />

          <div className="buttons">
            <button 
              className="primary sm flat"
              type="submit">Save</button>

            <button 
              className="sm flat"
              type="button"
              onClick={() => setEditable(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <p className="no-drag">{comment.value}</p>
      )}

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
