import { useAnnotationStore } from '@annotorious/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { Tag } from '../Tag';
import { TagInput } from './TagInput';

import './TagList.css';
import { MoreTags } from './MoreTags';

interface TagListProps {

  i18n: Translations;

  annotation: Annotation;

  me: PresentUser | User;

}

export const TagList = (props: TagListProps) => {

  const store = useAnnotationStore();

  const tags = props.annotation.bodies.filter((b: AnnotationBody) => b.purpose === 'tagging');

  const displayed = tags.slice(0, 3);

  const more = Math.max(0, tags.length - displayed.length);

  const onCreate = (tag: AnnotationBody) => {
    store.addBody(tag);
  }

  const onDelete = (tag: AnnotationBody) => {
    store.deleteBody(tag);
  }

  return (
    <div className="annotation-taglist">
      <ul>
        {displayed.map((t: AnnotationBody) => (
          <li key={t.id}>
            <Tag 
              i18n={props.i18n} 
              tag={t} 
              onDelete={() => onDelete(t)} />
          </li>
        ))}
      </ul>

      {more > 0 && (
        <MoreTags 
          i18n={props.i18n}
          displayed={3} 
          tags={tags} 
          onDelete={onDelete} />
      )}

      {/* <TagInput 
        i18n={props.i18n} 
        annotation={props.annotation}
        me={props.me}
      onCreate={onCreate} /> */}
    </div>
  )

}