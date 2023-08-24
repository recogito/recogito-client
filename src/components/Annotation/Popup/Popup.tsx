import { Annotation } from '@components/Annotation';
import { useAnnotator, useAnnotatorUser, Visibility } from '@annotorious/react';
import type { Annotation as Anno, PresentUser, User } from '@annotorious/react';
import type { Translations } from 'src/Types';

import './Popup.css';

interface PopupProps {

  selected: Anno[];

  i18n: Translations;

  present: PresentUser[];

}

export const Popup = (props: PopupProps) => {

  const anno = useAnnotator();

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  // Popup only supports a single selected annotation for now
  const selected = props.selected[0];

  const isPrivate = selected.visibility === Visibility.PRIVATE;

  const isMine = selected.target.creator?.id === me.id;

  const hasBodies = selected.bodies.length > 0;

  // Close the popup after a reply
  const onReply = () => anno.state.selection.clear();

  return (
    <div 
      key={selected.id}
      className={isPrivate ? 
        'annotation-popup private not-annotatable' : 'annotation-popup not-annotatable'}>
    
      {hasBodies ? (
        isPrivate ? (
          <Annotation.PrivateCard 
            {...props} 
            showReplyForm
            annotation={selected} 
            onReply={onReply} />
        ) : (
          <Annotation.PublicCard
            {...props} 
            showReplyForm
            annotation={selected} 
            onReply={onReply} />
        )
      ) : isMine ? (
        isPrivate ? (
          <div className="annotation-card private">
            <Annotation.ReplyForm 
              {...props}
              autofocus
              me={me}
              annotation={selected}
              placeholder={props.i18n.t['Comment...']}
              onSubmit={onReply} />
          </div>
        ) : (
          <div className="annotation-card">
            <Annotation.ReplyForm 
              {...props}
              autofocus
              me={me}
              annotation={selected}
              placeholder={props.i18n.t['Comment...']}
              onSubmit={onReply} />
          </div>
        )
      ) : (
        <Annotation.EmptyCard 
          {...props} 
          typing
          annotation={selected}
          selected />
      )}
    </div>
  )

}