import { useEffect, useMemo, useRef, useState } from 'react';
import type { Filter } from '@annotorious/react';
import { AnnotationCard } from '@components/Annotation';
import type { Layer, Policies, Translations } from 'src/Types';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { ViewportFilter, ViewportFilterToggle } from './ViewportFilterToggle';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import type { 
  Annotation as Anno,
  AnnotationBody,
  Annotator,
  DrawingStyleExpression,
  PresentUser
} from '@annotorious/react';
import { 
  useAnnotations,
  useAnnotator,
  useSelection,
  useViewportState,
  useAnnotationStore
} from '@annotorious/react';

import './AnnotationList.css';

interface AnnotationListProps<T extends Anno> {

  currentStyle?: DrawingStyleExpression<SupabaseAnnotation> | HighlightStyleExpression;

  filter?: Filter;

  i18n: Translations;

  isProjectLocked: boolean;

  layers?: Layer[];

  layerNames: Map<string, string>;

  me: PresentUser;

  present: PresentUser[];

  policies?: Policies;

  sorting?: ((a: T, b: T) => number);

  tagVocabulary?: string[];

  beforeSelect(a: SupabaseAnnotation | undefined): void;

}

export const AnnotationList = <T extends Anno>(props: AnnotationListProps<T>) => {

  const el = useRef<HTMLUListElement>(null);

  const all = useAnnotations(150);
  
  const visible = useViewportState(150);

  // 'Show all' vs. 'Show in viewport' setting
  const [viewportFilter, setViewportFilter] = useState<ViewportFilter>(ViewportFilter.NONE);

  const [autofocus, setAutofocus] = useState(false);

  const applyFilter = () => {
    if (viewportFilter === ViewportFilter.VIEWPORT) {
      return visible;
    } else {
      return all;
    }
  }

  const annotations = props.filter ? 
    applyFilter().filter(props.filter) : applyFilter();

  const { selected, pointerEvent } = useSelection();

  const sorted = useMemo(() => {
    // @ts-ignore
    return props.sorting ? [...annotations].sort(props.sorting) : annotations;
  }, [annotations, props.sorting]);

  const anno = useAnnotator<Annotator>();

  const store = useAnnotationStore();

  const activeLayer = useMemo(() => (
    (props.layers || []).find(l => l.is_active)
  ), [props.layers]);

  const onClick = (event: React.MouseEvent, a?: SupabaseAnnotation) => {  
    event.stopPropagation();

    const isAlreadySelected = a && isSelected(a);
    if (!isAlreadySelected) {
      props.beforeSelect(a);

      if (a) {
        // Annotation targets are editable for creators and admins
        const me = anno?.getUser()?.id;

        const isActiveLayer = a.layer_id === activeLayer?.id;

        const canEdit = isActiveLayer && (
          a.target.creator?.id === me || props.policies?.get('layers').has('INSERT'));

        anno.state.selection.setSelected(a.id, canEdit);
      } else {
        anno.state.selection.clear();
      }
    }
  }
  const onSubmit = (annotation: SupabaseAnnotation) => {
    // Follow GoogleDocs pattern which de-selects annotations
    // when they are new, but keeps the reply field open
    // after adding a reply
    const hasReplies =
      store && store.getAnnotation(annotation.id)!.bodies.filter(b => b.purpose === 'commenting').length > 1;

    if (!hasReplies)
      anno.state.selection.clear();
  }

  // Shorthands
  const isSelected = (a: SupabaseAnnotation) => 
    selected.length > 0 && selected[0].annotation.id == a.id;

  const isReadOnly = (a: SupabaseAnnotation) =>
    !(a.layer_id && a.layer_id === activeLayer?.id);

  const onDeleteAnnotation = (annotation: Anno) => 
    store?.deleteAnnotation(annotation);

  const onUpdateAnnotation = (updated: SupabaseAnnotation) =>
    store?.updateAnnotation(updated);

  const onCreateBody = (body: AnnotationBody) =>
    store?.addBody(body);

  const onDeleteBody = (body: AnnotationBody) =>
    store?.deleteBody(body);

  const onBulkDeleteBodies = (bodies: AnnotationBody[]) =>
    // TODO to replace with store.bulkDeleteBodies once supported in Annotorious!
    bodies.forEach(b => store?.deleteBody(b));

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store?.updateBody(oldValue, newValue);
    
  useEffect(() => {
    // Scroll the first selected card into view
    if (selected?.length > 0 && pointerEvent) {
      setTimeout(() => {
        const card = el.current?.querySelector('.selected');
        if (card)
         card.scrollIntoView({ behavior: 'smooth', block: 'center' });  
      }, 1);
    }
    
    // Don't focus reply before pointer up, otherwise the selection breaks!
    setAutofocus(pointerEvent?.type === 'pointerup');
  }, [pointerEvent, selected.map(s => s.annotation.id).join('-')]);

  const getBorderColor = (annotation: Anno) => {
    if (props.currentStyle) {
      const styled = typeof props.currentStyle === 'function' 
        ? props.currentStyle(annotation, {}) : props.currentStyle;
        
      return styled?.fill;
    }
  }

  const className = selected.length > 0 
    ? 'anno-drawer-panel annotation-list not-annotatable has-selected'
    : 'anno-drawer-panel annotation-list not-annotatable'

  return (
    <div className={className}>
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
            
            <AnnotationCard 
              annotation={annotation}
              autoFocus={autofocus}
              borderColor={getBorderColor(annotation)}
              i18n={props.i18n}
              isProjectLocked={props.isProjectLocked}
              isReadOnly={isReadOnly(annotation)}
              isSelected={isSelected(annotation)}
              layerNames={props.layerNames}
              policies={props.policies}
              present={props.present}
              showReplyField={!isReadOnly(annotation) && isSelected(annotation)}
              tagVocabulary={props.tagVocabulary} 
              onUpdateAnnotation={onUpdateAnnotation}
              onCreateBody={onCreateBody} 
              onDeleteBody={onDeleteBody} 
              onBulkDeleteBodies={onBulkDeleteBodies}
              onUpdateBody={onUpdateBody}
              onDeleteAnnotation={() => onDeleteAnnotation(annotation)} 
              onSubmit={() => onSubmit(annotation)} />
          </li>
        ))}
      </ul>
    </div>
  )

}