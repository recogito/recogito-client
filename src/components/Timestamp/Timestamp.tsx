import Moment from 'react-moment';

import 'moment/locale/de';

interface TimestampProps {

  datetime: string | number | Date;

  locale: string;

}

export const Timestamp = (props: TimestampProps) => {

  return (
    <Moment format="LT MMM DD" locale={props.locale}>
      {props.datetime}
    </Moment>
  )

}