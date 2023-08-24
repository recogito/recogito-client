import { ChangeEvent, FormEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';

import './TagInput.css';

export interface TagInputProps {

  i18n: Translations;

  me: PresentUser | User;

  annotation: Annotation;

  onCreate(tag: AnnotationBody): void;

}

export const TagInput = (props: TagInputProps) => {

  const { me } = props;
  
  const [value, setValue] = useState('');

  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value)

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

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

    setValue('');

    props.onCreate(tag);
  }

  return (
    <form className="annotation-tag-input-form" onSubmit={onSubmit}>
      <input 
        placeholder="Add a tag..." 
        value={value} 
        onChange={onChange} />
    </form>
  )

}