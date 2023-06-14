import type { PresentUser, User } from '@annotorious/react';
import { ReplyForm } from '@components/Annotation/ReplyForm';
import { BodyHeader } from '../../BodyHeader';
import type { CardProps } from '../Card';

type NewByMeProps = CardProps & { 

  me: PresentUser | User

}

export const NewByMe = (props: NewByMeProps) => {

  const { creator, created } = props.annotation.target;

  return (
    <>
      <ReplyForm annotation={props.annotation} me={props.me} />
    </>
  )

}