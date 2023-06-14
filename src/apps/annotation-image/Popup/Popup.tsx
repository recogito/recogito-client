import { Annotation } from '@components/Annotation';
import { 
  useAnnotator,
  type OpenSeadragonPopupProps,
  type PresentUser
} from '@annotorious/react';

import './Popup.css';

type PopupProps = OpenSeadragonPopupProps & {

  present: PresentUser[];

}

export const Popup = (props: PopupProps) => {

  const anno = useAnnotator();

  // Popup only supports a single selected annotation for now
  const selected = props.selection[0];

  // Close the popup after a reply
  const onReply = () =>
    anno.selection.clear();

  return (
    <article className="annotation-popup ia-annotation-popup">
      <Annotation.Card
        annotation={selected} 
        present={props.present} 
        onReply={onReply}/>
    </article>
  )

}