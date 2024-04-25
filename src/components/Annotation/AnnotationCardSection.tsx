import { useMemo, useState } from 'react';
import { Detective } from '@phosphor-icons/react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Delta } from 'quill/core';
import { useAuthorColors } from '@components/AnnotationDesktop';
import { Avatar } from '@components/Avatar';
import { QuillEditor, QuillEditorRoot } from '@components/QuillEditor';
import { AuthorDetails } from './AuthorDetails';
import { PrivateAnnotationActions } from './PrivateAnnotationActions';
import { PublicAnnotationActions } from './PublicAnnotationActions';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {

  index: number;

  comment: AnnotationBody;

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  isPrivate?: boolean;

  me: User | PresentUser;

  present: PresentUser[];

  policies?: Policies;
  
  onDeleteAnnotation(): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onMakePublic(): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

export const AnnotationCardSection = (props: AnnotationCardSectionProps) => {

  const { comment, isPrivate, me, present } = props;

  const colors = useAuthorColors();

  const [editable, setEditable] = useState(false);

  const creator: PresentUser | User | undefined = 
    present.find(p => p.id === props.comment.creator?.id) || comment.creator;

  const color = useMemo(() => colors.getColor(creator), [colors, creator]);

  const isMine = creator?.id === me.id;

  // Comments are editable if they are mine, or I'm a layer admin
  const canEdit = isMine || props.policies?.get('layers').has('INSERT');

  const format = comment.value && comment.value.length > 0 && comment.value.charAt(0) === '{'
    ? 'Quill' : 'TextPlain';

  const [value, setValue] = useState<Delta | undefined>(
    format === 'Quill'
      ? JSON.parse(comment.value!)
      : new Delta().insert(comment.value || ''));

  const onUpdateComment = () => {    
    const next = {
      ...comment,
      format: 'Quill',
      value: JSON.stringify(value)
    };

    props.onUpdateBody(comment, next);

    setEditable(false);
  }

  return (
    <div className={editable ? 'annotation-section editable' : 'annotation-section'}>
      <div className="annotation-header">
        <div className="annotation-header-left">
          {isPrivate ? (
            <div className="avatar private-avatar">
              <div 
                className="avatar-wrapper ring"
                style={color ? { borderColor: color } : undefined}>
                <div className="avatar-fallback">
                  <Detective size={17} />
                </div>
              </div>
            </div>
          ) : creator && (
            <Avatar
              id={creator.id}
              name={(creator as PresentUser).appearance?.label || creator.name}
              avatar={(creator as PresentUser).appearance?.avatar} 
              color={color} />
          )}

          <AuthorDetails 
            i18n={props.i18n}
            isPrivate={isPrivate} 
            creator={creator}
            createdAt={comment.created} />
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
            value={value} 
            onChange={setValue} />
        </QuillEditorRoot>
      </div>

      {/*props.tags?.length > 0 && (
        <div className="annotation-taglist-wrapper">
          <TagList 
            tags={props.tags} 
            isEditable={props.isEditable} />
        </div>
      )} */}

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