import { useAnnotationStore } from '@annotorious/react';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { MoreTags } from './MoreTags';
import { Tag } from '../Tag';
import { AddTagAction } from './AddTagAction';
import { TagInput } from './TagInput';

import './TagsWidget.css';

interface TagsWidgetProps {

  i18n: Translations;

  annotation: Annotation;

  me: PresentUser | User;

  vocabulary?: string[];

}

export const TagsWidget = (props: TagsWidgetProps) => {

  const store = useAnnotationStore();

  const tags = props.annotation.bodies.filter((b: AnnotationBody) => b.purpose === 'tagging');

  const displayed = tags.slice(0, 3);

  const more = Math.max(0, tags.length - displayed.length);

  const onCreate = (tag: AnnotationBody) => {
    // Don't add tags that exist already
    const exists = tags.some((t: AnnotationBody) => t.value === tag.value);
    if (!exists)
      store.addBody(tag);
  }

  const onDelete = (tag: AnnotationBody) => {
    store.deleteBody(tag);
  }

  return (
    <div className="annotation-tagswidget">
      <div className="tags">
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

        {displayed.length < 3 ? (
          <TagInput 
            i18n={props.i18n} 
            annotation={props.annotation}
            me={props.me}
            vocabulary={props.vocabulary}
            onCreate={onCreate} />
        ) : more > 0 && (
          <MoreTags 
            i18n={props.i18n}
            displayed={3} 
            tags={tags} 
            onDelete={onDelete} />
        )}
      </div>

      {displayed.length > 2 && (
        <AddTagAction 
          i18n={props.i18n} 
          annotation={props.annotation} 
          me={props.me} 
          vocabulary={props.vocabulary}
          onCreate={onCreate} />
      )}
    </div>
  )

}