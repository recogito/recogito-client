import { format } from 'date-fns';
import { de } from 'date-fns/locale'

interface TimestampProps {

  datetime: string | number | Date;

  locale?: string;

}

export const Timestamp = (props: TimestampProps) => {

  const locale = props.locale === 'de' ? de : undefined;

  return (
    <span>
      {format(props.datetime, 'HH:mm MMM dd', { locale })}
    </span>
  )

}