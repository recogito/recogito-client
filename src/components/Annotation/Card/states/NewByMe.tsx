import { ReplyForm } from '@components/Annotation/ReplyForm';
import type { CardProps } from '../Card';

export const NewByMe = (props: CardProps) => {

  return (
    <ReplyForm 
      {...props} 
      onSubmit={props.onReply} />
  )

}