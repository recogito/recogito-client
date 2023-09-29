import { v4 as uuidv4 } from 'uuid';
import type { Annotation, AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { Autocomplete } from './Autocomplete';

import './TagInput.css';

export interface TagInputProps {

  i18n: Translations;

  me: PresentUser | User;

  annotation: Annotation;

  vocabulary?: string[];

  onCreate(tag: AnnotationBody): void;

}

export const TagInput = (props: TagInputProps) => {

  const { me } = props;
  
  const onSubmit = (value: string) => {
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

    props.onCreate(tag);
  }

  return (
    <Autocomplete
      placeholder={props.i18n.t['Add a tag...']} 
      onSubmit={onSubmit}
      vocabulary={props.vocabulary || []} />
  )

}