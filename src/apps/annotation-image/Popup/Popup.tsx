import { Annotation } from '@components/Annotation';
import { useAnnotator, useAnnotatorUser, Visibility } from '@annotorious/react';
import type { OpenSeadragonPopupProps, PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';

import './Popup.css';

type PopupProps = OpenSeadragonPopupProps & {

  i18n: Translations;

  present: PresentUser[];

}

export const Popup = (props: PopupProps) => {

  const anno = useAnnotator();

  const me = useAnnotatorUser();

  // Popup only supports a single selected annotation for now
  const selected = props.selection[0];

  const isPrivate = selected.visibility === Visibility.PRIVATE;

  const isMine = selected.target.creator?.id === me.id;

  const hasBodies = selected.bodies.length > 0;

  // Close the popup after a reply
  const onReply = () => anno.selection.clear();

  return (
    <div 
      className={isPrivate ? 
        'annotation-popup ia-annotation-popup private' : 'annotation-popup ia-annotation-popup'}>
    
      {hasBodies ? (
        isPrivate ? (
          <Annotation.PrivateCard 
            {...props} 
            showReplyForm
            annotation={selected} />
        ) : (
          <Annotation.PublicCard
            {...props} 
            showReplyForm
            annotation={selected} />
        )
      ) : isMine ? (
        isPrivate ? (
          <div className="annotation-card private">
            <Annotation.ReplyForm 
              {...props}
              annotation={selected}
              onSubmit={onReply} />
          </div>
        ) : (
          <div className="annotation-card">
            <Annotation.ReplyForm 
              {...props}
              annotation={selected}
              onSubmit={onReply} />
          </div>
        )
      ) : (
        <Annotation.EmptyCard 
          {...props} 
          typing
          annotation={selected} />
      )}
    </div>
  )

}