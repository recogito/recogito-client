import { useEffect, useMemo, useRef, useState } from 'react';
import { Annotation } from '@components/Annotation';
import type { Policies, Translations } from 'src/Types';
import { SupabaseAnnotation, Visibility } from '@recogito/annotorious-supabase';
import { ViewportFilter, ViewportFilterToggle } from './ViewportFilterToggle';
import { useFilterSettings } from '../LayerConfiguration';
import { 
  Annotation as Anno,
  AnnotationBody,
  type Annotator,
  PresentUser, 
  useAnnotations,
  useAnnotator,
  useAnnotatorUser,
  useSelection,
  User,
  useViewportState,
  useAnnotationStore
} from '@annotorious/react';

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

  // 'Show all' vs. 'Show in viewport' setting
  const [viewportFilter, setViewportFilter] = useState<ViewportFilter>(ViewportFilter.NONE);

  // Global annotation layer filter
  const { filter } = useFilterSettings();

  const [autofocus, setAutofocus] = useState(false);

  const applyFilter = () => {
    if (viewportFilter === ViewportFilter.VIEWPORT) {
      return visible;
    } else {
      return all;
    }
  }

  const annotations = applyFilter();

  const sorted = useMemo(() => {
    const filtered = filter ? annotations.filter(filter) : annotations;
    return props.sorting ? [...filtered].sort(props.sorting) : filtered;
  }, [annotations, filter]);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const anno = useAnnotator<Annotator>();

  const store = useAnnotationStore();

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
    a.visibility === Visibility.PRIVATE;

  const getReplyFormClass = (a: SupabaseAnnotation) => {
    const classes = ['annotation-card'];

    if (isSelected(a))
      classes.push('selected');

    if (isPrivate(a))
      classes.push('private')
    
    return classes.join(' ');
  }

  const onDeleteAnnotation = (annotation: Anno) => 
    store.deleteAnnotation(annotation);

  const onCreateBody = (body: AnnotationBody) =>
    store.addBody(body);

  const onDeleteBody = (body: AnnotationBody) =>
    store.deleteBody(body);

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store.updateBody(oldValue, newValue);
    
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
    <div className="anno-drawer-panel annotation-list">
      <ViewportFilterToggle 
        i18n={props.i18n} 
        onChange={setViewportFilter} />

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
                      vocabulary={props.tagVocabulary} 
                      onCreateTag={onCreateBody} 
                      onDeleteTag={onDeleteBody} />

                    <Annotation.ReplyForm
                      autofocus={autofocus}
                      i18n={props.i18n}
                      me={me} 
                      scrollIntoView
                      annotation={a} 
                      placeholder={props.i18n.t['Comment...']}
                      onSubmit={onCreateBody} />
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
                  tagVocabulary={props.tagVocabulary} 
                  onReply={onCreateBody}
                  onCreateBody={onCreateBody} 
                  onDeleteBody={onDeleteBody} 
                  onUpdateBody={onUpdateBody}
                  onDeleteAnnotation={() => onDeleteAnnotation(a)} />
              ) : (
                <Annotation.PublicCard 
                  className={isSelected(a) ? 'selected' : undefined}
                  showReplyForm={isSelected(a)}
                  i18n={props.i18n}
                  annotation={a} 
                  present={props.present}
                  policies={props.policies} 
                  tagVocabulary={props.tagVocabulary} 
                  onReply={onCreateBody}
                  onCreateBody={onCreateBody} 
                  onDeleteBody={onDeleteBody} 
                  onUpdateBody={onUpdateBody}
                  onDeleteAnnotation={() => onDeleteAnnotation(a)} />  
              )
            )}
          </li>
        ))}
      </ul>
    </div>
  )

}