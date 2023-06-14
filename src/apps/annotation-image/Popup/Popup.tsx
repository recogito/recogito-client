import { Annotation } from '@components/Annotation';
import type { 
  OpenSeadragonPopupProps,
  PresentUser
} from '@annotorious/react';

import './Popup.css';

type PopupProps = OpenSeadragonPopupProps & {

  present: PresentUser[];

}

export const Popup = (props: PopupProps) => {

  // Popup only supports a single selected annotation for now
  const selected = props.selection[0];

  return (
    <article className="annotation-popup ia-annotation-popup">
      <Annotation.Card
        annotation={selected} 
        present={props.present} />
    </article>
  )

}