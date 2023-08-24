import { useAnnotationStore } from '@annotorious/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { Tag } from '../Tag';
import { TagInput } from './TagInput';
import { TagListActions } from './TagListActions';

import './TagList.css';

interface TagListProps {

  i18n: Translations;

  annotation: Annotation;

  me: PresentUser | User;

}

export const TagList = (props: TagListProps) => {

  const store = useAnnotationStore();

  const tags = props.annotation.bodies.filter((b: AnnotationBody) => b.purpose === 'tagging');

  console.log(tags);

  const onCreate = (tag: AnnotationBody) => {
    store.addBody(tag);
  }

  return (
    <div className="annotation-taglist">
      <ul>
        {tags.map((t: AnnotationBody) => (
          <li key={t.id}>
            {t.value}
          </li>
        ))}
      </ul>

      <TagInput 
        i18n={props.i18n} 
        annotation={props.annotation}
        me={props.me}
        onCreate={onCreate} />

      <div className="annotation-taglist-actions">
        <TagListActions i18n={props.i18n} />
      </div>
    </div>
  )

}