import { useEffect, useState } from 'react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Delta } from 'quill/core';
import { QuillEditor, QuillEditorRoot } from '@components/QuillEditor';
import { AuthorAvatar } from './AuthorAvatar';
import { AuthorDetails } from './AuthorDetails';
import { PrivateAnnotationActions } from './PrivateAnnotationActions';
import { PublicAnnotationActions } from './PublicAnnotationActions';
import { TagList } from './TagList';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {

  index: number;

  comment?: AnnotationBody;

  tags?: AnnotationBody[];

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  isPrivate?: boolean;

  isReadOnly?: boolean;

  me: User | PresentUser;

  present: PresentUser[];

  policies?: Policies;
  
  onDeleteAnnotation(): void;

  onCreateTag(value: string): void;

  onDeleteBody(body: AnnotationBody): void;

  onMakePublic(): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

const parseBody = (body?: AnnotationBody): Delta | undefined => 
  body?.value ? body.value.length > 0 && body.value.charAt(0) === '{'
      ? JSON.parse(body.value)
      : new Delta().insert(body!.value || '')
  : undefined;

export const AnnotationCardSection = (props: AnnotationCardSectionProps) => {

  const { comment, isPrivate, isReadOnly, me, present } = props;

  const [editable, setEditable] = useState(false);

  const firstBody = [props.comment, ...(props.tags || [])].filter(Boolean)[0];

  const creator: PresentUser | User | undefined = firstBody &&
    (present.find(p => p.id === firstBody.creator?.id) || firstBody.creator);

  const isMine = creator?.id === me.id;

  // Comments are editable if they are mine, or I'm a layer admin
  const canEdit = !isReadOnly && (isMine || props.policies?.get('layers').has('INSERT'));

  const [commentValue, setCommentValue] = useState<Delta | undefined>(parseBody(comment));

  useEffect(() => {
    setCommentValue(parseBody(props.comment));
  }, [props.comment]);

  const onUpdateComment = () => {    
    if (!comment) return;

    const next = {
      ...comment,
      format: 'Quill',
      value: JSON.stringify(commentValue)
    };

    props.onUpdateBody(comment, next);

    setEditable(false);
  }

  const className = [
    'annotation-section',
    editable ? 'editable' : undefined,
    props.emphasizeOnEntry ? 'is-new' : undefined 
  ].filter(Boolean).join(' ');

  return firstBody && (
    <div className={className}>
      <div className="annotation-header">
        <div className="annotation-header-left">
          <AuthorAvatar 
            author={creator}
            isPrivate={isPrivate} />

          <AuthorDetails 
            i18n={props.i18n}
            isPrivate={isPrivate} 
            creator={creator}
            createdAt={firstBody.created} />
        </div>

        {canEdit && (
          <div className="annotation-header-right">
            {isPrivate ? (
              <PrivateAnnotationActions
                i18n={props.i18n} 
                isFirst={props.index === 0} 
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteComment={() => props.onDeleteBody(comment)}
                onEditComment={() => setEditable(true)} 
                onMakePublic={props.onMakePublic}/>
            ) : (
              <PublicAnnotationActions 
                i18n={props.i18n} 
                isFirst={props.index === 0} 
                isMine={isMine}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteComment={() => props.onDeleteBody(comment)}
                onEditComment={() => setEditable(true)} />
            )}    
          </div>
        )}
      </div>

      <div className="annotation-comment-wrapper">
        <QuillEditorRoot>
          <QuillEditor 
            readOnly={!editable}
            value={commentValue} 
            onChange={setCommentValue} />
        </QuillEditorRoot>
      </div>

      {props.tags && props.tags.length > 0 && (
        <div className="annotation-taglist-wrapper">
          <TagList 
            isEditable={editable}
            me={props.me}
            i18n={props.i18n}
            tags={props.tags}
            onCreateTag={props.onCreateTag}
            onDeleteTag={props.onDeleteBody} />
        </div>
      )}

      {editable && (
        <div className="annotation-section-footer align-right">
          <button 
            className="sm flat unstyled"
            onClick={() => setEditable(false)}>
            Cancel
          </button>

          <button 
            className="sm flat primary"
            onClick={onUpdateComment}>
            Save
          </button>
        </div>
      )}
    </div>
  )

}