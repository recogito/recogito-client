import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { Delta } from 'quill/core';
import { QuillEditor, QuillEditorRoot, isEmpty } from '@components/QuillEditor';
import { AuthorAvatar } from './AuthorAvatar';
import { AuthorDetails } from './AuthorDetails';
import { PrivateAnnotationActions } from './PrivateAnnotationActions';
import { PublicAnnotationActions } from './PublicAnnotationActions';
import { TagList } from './TagList';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {

  annotation: SupabaseAnnotation;

  isSelected?: boolean;

  comment?: AnnotationBody;

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  index: number;

  isPrivate?: boolean;

  isReadOnly?: boolean;

  me: User | PresentUser;

  present: PresentUser[];

  policies?: Policies;

  tags?: AnnotationBody[];
  
  onDeleteAnnotation(): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onMakePublic(): void;

  onSubmit(): void;

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

  const hasReplies = props.annotation.bodies.filter(b => b.purpose === 'commenting').length > 1;

  const isMine = creator?.id === me.id;

  // Comments are editable if they are mine, or I'm a layer admin
  const canEdit = !isReadOnly && (isMine || props.policies?.get('layers').has('INSERT'));

  const [commentValue, setCommentValue] = useState<Delta | undefined>(parseBody(comment));

  useEffect(() => setCommentValue(parseBody(props.comment)), [props.comment]);

  const onDeleteSection = () => {
    const toDelete: AnnotationBody[] = [
      props.comment!,
      ...(props.tags || [])
    ].filter(Boolean);

    props.onBulkDeleteBodies(toDelete);
  }

  const onSave = () => {   
    if (commentValue && !isEmpty(commentValue)) {
      console.log(commentValue);

      // Update existing or create new
      const next = comment ? {
        ...comment,
        format: 'Quill',
        value: JSON.stringify(commentValue)
      } : {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: props.me.id,
          name: props.me.name,
          avatar: props.me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        format: 'Quill',
        value: JSON.stringify(commentValue)
      }
      
      if (comment)
        props.onUpdateBody(comment, next);
      else
        props.onCreateBody(next);
    } else {
      if (comment)
        props.onDeleteBody(comment);
    }

    setEditable(false);

    props.onSubmit();
  }

  const onCreateTag = (value: string) => {
    const tag: AnnotationBody = {
      id: uuidv4(),
      annotation: props.annotation.id,
      creator: {  
        id: me.id,
        name: me.name,
        avatar: me.avatar
      },
      created: new Date(),
      purpose: 'tagging',
      value
    };

    props.onCreateBody(tag);
  }

  useEffect(() => {
    // Stop editing when annotation is deselected
    if (!props.isSelected)
      setEditable(false);
  }, [props.isSelected]);

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
                hasReplies={hasReplies}
                i18n={props.i18n} 
                isFirst={props.index === 0}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteSection={onDeleteSection}
                onEditSection={() => setEditable(true)}
                onMakePublic={props.onMakePublic}/>
            ) : (
              <PublicAnnotationActions 
                hasReplies={hasReplies}
                i18n={props.i18n} 
                isFirst={props.index === 0} 
                isMine={isMine}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteSection={onDeleteSection}
                onEditSection={() => setEditable(true)} />
            )}    
          </div>
        )}
      </div>

      {(commentValue || editable) && (
        <div className="annotation-comment-wrapper">
          <QuillEditorRoot>
            <QuillEditor 
              i18n={props.i18n}
              readOnly={!editable}
              value={commentValue} 
              onChange={setCommentValue} />
          </QuillEditorRoot>
        </div>
      )}

      {(props.index === 0 && ((props.tags || []).length > 0 || editable)) && (
        <div className="annotation-taglist-wrapper">
          <TagList 
            isEditable={editable}
            me={props.me}
            i18n={props.i18n}
            tags={props.tags || []}
            onCreateTag={onCreateTag}
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
            onClick={onSave}>
            Save
          </button>
        </div>
      )}
    </div>
  )

}