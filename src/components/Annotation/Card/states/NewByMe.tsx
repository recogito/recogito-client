import { useAnnotatorUser } from '@annotorious/react';
import { ReplyForm } from '@components/Annotation/ReplyForm';
import type { CardProps } from '../Card';

export const NewByMe = (props: CardProps) => {

  const user = useAnnotatorUser();

  const me = props.present.find(p => p.id === user.id) || user;

  return (
    <ReplyForm annotation={props.annotation} me={me} />
  )

}