import { Annotation } from '@components/Annotation';
import type { Translations } from 'src/Types';
import { 
  Annotation as Anno, 
  AnnotoriousOpenSeadragonAnnotator,
  PresentUser, 
  useAnnotations,
  useAnnotator,
  useAnnotatorUser,
  useSelection,
  Visibility, 
} from '@annotorious/react';

import './AnnotationList.css';

interface AnnotationListProps {

  i18n: Translations;

  present: PresentUser[];

  beforeSelect(a: Anno | undefined): void;

}

export const AnnotationList = (props: AnnotationListProps) => {

  const annotations = useAnnotations();

  const me = useAnnotatorUser();

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const { selected } = useSelection();

  const onClick = (event: React.MouseEvent, a?: Anno) => {    
    event.stopPropagation();

    props.beforeSelect(a);

    if (a)
      anno.state.selection.setSelected(a.id);
    else
      anno.state.selection.clear();
  }

  // Shorthands
  const isSelected = (a: Anno) => 
    selected.length > 0 && selected[0].id == a.id;

  const isMine = (a: Anno) =>
    me.id === a.target.creator?.id;

  const isPrivate = (a: Anno) =>
    a.visibility === Visibility.PRIVATE

  const getReplyFormClass = (a: Anno) => {
    const classes = ['annotation-card'];

    if (isSelected(a))
      classes.push('selected');

    if (isPrivate(a))
      classes.push('private')
    
    return classes.join(' ');
  }

  return (
    <ul className="anno-sidepanel annotation-list" onClick={onClick}>
      {annotations.map(a => (
        <li 
          key={a.id}
          onClick={event => onClick(event, a)}>
          {a.bodies.length === 0 ? (
            isMine(a) ? (              
              isSelected(a) ? (
                <div className={getReplyFormClass(a)}>
                  <Annotation.ReplyForm
                    annotation={a} 
                    placeholder={props.i18n.t['Comment...']}
                    present={props.present} />
                </div>
              ) : (
                <Annotation.EmptyCard
                  private={isPrivate(a)}
                  i18n={props.i18n}
                  annotation={a} 
                  present={props.present} />
              )
            ) : (
              <Annotation.EmptyCard 
                typing
                i18n={props.i18n} 
                annotation={a} 
                present={props.present} />              
            )
          ) : (
            isPrivate(a) ? (
              <Annotation.PrivateCard 
                className={isSelected(a) ? 'selected' : undefined}
                showReplyForm={isSelected(a)}
                i18n={props.i18n}
                annotation={a} 
                present={props.present} />
            ) : (
              <Annotation.PublicCard 
                className={isSelected(a) ? 'selected' : undefined}
                showReplyForm={isSelected(a)}
                i18n={props.i18n}
                annotation={a} 
                present={props.present} />  
            )
          )}
        </li>
      ))}
    </ul>
  )

}