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

  onCreateTag(tag: AnnotationBody): void;

  onDeleteTag(tag: AnnotationBody): void;

}

export const TagsWidget = (props: TagsWidgetProps) => {

  const tags = props.annotation.bodies.filter((b: AnnotationBody) => b.purpose === 'tagging');

  const displayed = tags.slice(0, 3);

  const more = Math.max(0, tags.length - displayed.length);

  const onCreateTag = (tag: AnnotationBody) => {
    // Don't add a tag that exist already
    const exists = tags.some((t: AnnotationBody) => t.value === tag.value);
    if (!exists)
      props.onCreateTag(tag);
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
                onDelete={() => props.onDeleteTag(t)} />
            </li>
          ))}
        </ul>

        {displayed.length < 3 ? (
          <TagInput 
            i18n={props.i18n} 
            annotation={props.annotation}
            me={props.me}
            vocabulary={props.vocabulary}
            onCreate={onCreateTag} />
        ) : more > 0 && (
          <MoreTags 
            i18n={props.i18n}
            displayed={3} 
            tags={tags} 
            onDelete={props.onDeleteTag} />
        )}
      </div>

      {displayed.length > 2 && (
        <AddTagAction 
          i18n={props.i18n} 
          annotation={props.annotation} 
          me={props.me} 
          vocabulary={props.vocabulary}
          onCreate={onCreateTag} />
      )}
    </div>
  )

}