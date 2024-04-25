import { useState } from 'react';
import { Detective, DotsThree } from '@phosphor-icons/react';
import type { AnnotationBody, PresentUser } from '@annotorious/react';
// import { Avatar } from './Avatar';
import { QuillEditor, QuillEditorRoot } from '@components/QuillEditor';
import { AuthorDetails } from './AuthorDetails';
// import { TagList } from './Tags/TagList';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {

  index: number;

  comment: AnnotationBody;

  editable?: boolean

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

  const [editable, setEditable] = useState(false);

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
          ) : (
            <div>{/* Avatar */}</div>
          )}
          <AuthorDetails isPrivate={props.isPrivate} />
        </div>

        <div className="annotation-header-right">
          <DotsThree size={20} />
        </div>
      </div>

      <div className="annotation-comment-wrapper">
        <QuillEditorRoot>
          <QuillEditor 
            readOnly={!editable}
            value={'Lorem ipsum dolor sit amet consectetur.'}/>
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