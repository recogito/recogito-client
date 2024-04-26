import { useEffect, useMemo, useRef, useState } from 'react';
import { AnnotationCard, EmptyAnnotation } from '@components/Annotation';
import type { Layer, Policies, Translations } from 'src/Types';
import { SupabaseAnnotation, Visibility } from '@recogito/annotorious-supabase';
import { Extension, usePlugins } from '@components/Plugins';
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

interface AnnotationListProps<T extends Anno> {

  i18n: Translations;

  layers?: Layer[];

  me: PresentUser;

  present: PresentUser[];

  policies?: Policies;

  sorting?: ((a: T, b: T) => number);

  tagVocabulary?: string[];

  beforeSelect(a: SupabaseAnnotation | undefined): void;

}

export const AnnotationList = <T extends Anno>(props: AnnotationListProps<T>) => {

  const el = useRef<HTMLUListElement>(null);

  const plugins = usePlugins('annotation.*.annotation-editor');

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
    // @ts-ignore
    return props.sorting ? [...filtered].sort(props.sorting) : filtered;
  }, [annotations, filter]);

  const user = useAnnotatorUser();

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const anno = useAnnotator<Annotator>();

  const store = useAnnotationStore();

  const { selected, pointerEvent } = useSelection();

  const activeLayer = useMemo(() => (
    (props.layers || []).find(l => l.is_active)
  ), [props.layers]);

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

  const isReadOnly = (a: SupabaseAnnotation) =>
    !(a.layer_id && a.layer_id === activeLayer?.id);

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

  const onUpdateAnnotation = (updated: SupabaseAnnotation) =>
    store.updateAnnotation(updated);

  const onCreateBody = (body: AnnotationBody) =>
    store.addBody(body);

  const onDeleteBody = (body: AnnotationBody) =>
    store.deleteBody(body);

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store.updateBody(oldValue, newValue);
    
  useEffect(() => {
    // Scroll the first selected card into view
    if (selected?.length > 0) {
      setTimeout(() => {
        const card = el.current?.querySelector('.selected');
        if (card)
         card.scrollIntoView({ behavior: 'smooth' });  
      }, 250);
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
        {sorted.map(annotation => (
          <li 
            key={annotation.id}
            onClick={event => onClick(event, annotation)}>
            {annotation.bodies.length === 0 ? (
              isMine(annotation) ? (     
                <EmptyAnnotation 
                  annotation={annotation} 
                  me={me} 
                  onCreateBody={onCreateBody} />         
              ) : (
                <div>{/* 
                <EmptyAnnotation 
                  typing
                  selected={isSelected(a)}
                  i18n={props.i18n} 
                  annotation={a} 
                  present={props.present} /> */}</div>             
              )
            ) : (
              <AnnotationCard 
                className={isSelected(annotation) ? 'selected' : undefined}
                showReplyForm={isSelected(annotation)}
                i18n={props.i18n}
                isReadOnly={isReadOnly(annotation)}
                annotation={annotation} 
                present={props.present}
                tagVocabulary={props.tagVocabulary} 
                onReply={onCreateBody}
                onUpdateAnnotation={onUpdateAnnotation}
                onCreateBody={onCreateBody} 
                onDeleteBody={onDeleteBody} 
                onUpdateBody={onUpdateBody}
                onDeleteAnnotation={() => onDeleteAnnotation(annotation)} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )

}