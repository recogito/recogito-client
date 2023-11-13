import { useEffect, useMemo, useRef, useState } from 'react';
import { Annotation } from '@components/Annotation';
import type { Policies, Translations } from 'src/Types';
import { SupabaseAnnotation, Visibility } from '@recogito/annotorious-supabase';
import { 
  Annotation as Anno,
  PresentUser, 
  useAnnotations,
  useAnnotator,
  useAnnotatorUser,
  useSelection,
  User,
  useViewportState
} from '@annotorious/react';
import type { Annotator } from '@annotorious/react';
import { Filter, FilterSelector } from './FilterSelector';

import './AnnotationList.css';

interface AnnotationListProps {

  i18n: Translations;

  present: PresentUser[];

  me: PresentUser;

  policies?: Policies;

  sorting?: ((a: Anno, b: Anno) => number);

  tagVocabulary?: string[];

  beforeSelect(a: SupabaseAnnotation | undefined): void;

}

export const AnnotationList = (props: AnnotationListProps) => {

  const el = useRef<HTMLUListElement>(null);

  const all = useAnnotations(150);
  
  const visible = useViewportState(150);

  const [filter, setFilter] = useState<Filter>(Filter.NONE);

  const [autofocus, setAutofocus] = useState(false);

  const applyFilter = () => {
    if (filter === Filter.VIEWPORT) {
      return visible;
    } else if (filter === Filter.MINE) {
      return all.filter(a => a.target.creator?.id === props.me.id);
    } else {
      return all;
    }
  }

  const annotations = applyFilter();

  const sorted = useMemo(() => 
    props.sorting ? [...annotations].sort(props.sorting) : annotations, [annotations]);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const anno = useAnnotator<Annotator>();

  const { selected, pointerEvent } = useSelection();

  const onClick = (event: React.MouseEvent, a?: SupabaseAnnotation) => {    
    event.stopPropagation();

    props.beforeSelect(a);

    if (a)
      anno.state.selection.setSelected(a.id);
    else
      anno.state.selection.clear();
  }

  // Shorthands
  const isSelected = (a: SupabaseAnnotation) => 
    selected.length > 0 && selected[0].annotation.id == a.id;

  const isMine = (a: SupabaseAnnotation) =>
    me.id === a.target.creator?.id;

  const isPrivate = (a: SupabaseAnnotation) =>
    a.visibility === Visibility.PRIVATE

  const getReplyFormClass = (a: SupabaseAnnotation) => {
    const classes = ['annotation-card'];

    if (isSelected(a))
      classes.push('selected');

    if (isPrivate(a))
      classes.push('private')
    
    return classes.join(' ');
  }

  useEffect(() => {
    // Scroll the first selected card into view
    if (selected?.length > 0) {
     const card = el.current?.querySelector('.selected');
     if (card)
      card.scrollIntoView({ behavior: 'smooth' });
    }

    // Don't focus reply before pointer up, otherwise the selection breaks!
    setAutofocus(pointerEvent?.type === 'pointerup');
  }, [pointerEvent, selected.map(s => s.annotation.id).join('-')]);

  return (
    <div className="anno-sidepanel annotation-list" >
      <FilterSelector 
        i18n={props.i18n} 
        onChange={setFilter} />

      <ul
        ref={el}
        onClick={onClick}>
        {sorted.map(a => (
          <li 
            key={a.id}
            onClick={event => onClick(event, a)}>
            {a.bodies.length === 0 ? (
              isMine(a) ? (              
                isSelected(a) ? (
                  <div className={getReplyFormClass(a)}>
                    <Annotation.TagsWidget 
                      i18n={props.i18n} 
                      me={me} 
                      annotation={a}
                      vocabulary={props.tagVocabulary} />

                    <Annotation.ReplyForm
                      autofocus={autofocus}
                      i18n={props.i18n}
                      scrollIntoView
                      annotation={a} 
                      placeholder={props.i18n.t['Comment...']}
                      me={me} />
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
                  selected={isSelected(a)}
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
                  present={props.present}
                  tagVocabulary={props.tagVocabulary} />
              ) : (
                <Annotation.PublicCard 
                  className={isSelected(a) ? 'selected' : undefined}
                  showReplyForm={isSelected(a)}
                  i18n={props.i18n}
                  annotation={a} 
                  present={props.present}
                  policies={props.policies} 
                  tagVocabulary={props.tagVocabulary} />  
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  )

}