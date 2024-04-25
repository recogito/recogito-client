import { useState } from 'react';
import { Detective, DotsThree } from '@phosphor-icons/react';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import { Delta } from 'quill/core';
import { QuillEditor, QuillEditorRoot } from '@components/QuillEditor';
import { AuthorDetails } from './AuthorDetails';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';
import { Avatar } from '@components/Avatar';
import { useAuthorColors } from '@components/AnnotationDesktop';

export interface AnnotationCardSectionProps {

  index: number;

  comment: AnnotationBody;

  allowEditing?: boolean

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  isPrivate?: boolean;

  present: PresentUser[];

  policies?: Policies;
  
  onDeleteAnnotation(): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

export const AnnotationCardSection = (props: AnnotationCardSectionProps) => {

  const { comment, allowEditing } = props;

  const [editable, setEditable] = useState(false);

  const colors = useAuthorColors();

  const creator: PresentUser | User | undefined = 
    props.present.find(p => p.id === comment.creator?.id) || comment.creator;

  const format = comment.value && comment.value.length > 0 && comment.value.charAt(0) === '{'
    ? 'Quill' : 'TextPlain';

  const [value, setValue] = useState<Delta | undefined>(
    format === 'Quill'
      ? JSON.parse(comment.value!)
      : new Delta().insert(comment.value || ''));

  return (
    <div className={editable ? 'annotation-section editable' : 'annotation-section'}>
      <div className="annotation-header">
        <div className="annotation-header-left">
          {props.isPrivate ? (
            <div className="private-avatar">
              <div className="avatar-ring">
                <div className="avatar-inner">
                  <Detective size={17} />
                </div>
              </div>
            </div>
          ) : creator && (
            <Avatar
              id={creator.id}
              name={(creator as PresentUser).appearance?.label || creator.name}
              avatar={(creator as PresentUser).appearance?.avatar} 
              color={colors.getColor(creator)} />
          )}

          <AuthorDetails 
            i18n={props.i18n}
            isPrivate={props.isPrivate} 
            creator={creator}
            createdAt={comment.created} />
        </div>

        <div className="annotation-header-right">
          <DotsThree size={20} />
        </div>
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
          <button className="sm flat">
            Cancel
          </button>

          <button className="sm flat primary">
            Save
          </button>
        </div>
      )}
    </div>
  )

}