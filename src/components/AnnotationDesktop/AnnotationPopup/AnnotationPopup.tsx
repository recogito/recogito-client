import { useMemo } from 'react';
import { type AnnotationBody, useAnnotationStore, useAnnotator } from '@annotorious/react';
import type { Annotation as Anno, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { AnnotationCard } from '@components/Annotation';
import { isMobile } from './isMobile';
import type { DocumentLayer, Policies, Translations, VocabularyTerm } from 'src/Types';

import './AnnotationPopup.css';

interface AnnotationPopupProps {

  annotation: Anno; 

  editable?: boolean

  i18n: Translations;

  isProjectLocked: boolean;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

  policies?: Policies;

  tagVocabulary?: VocabularyTerm[];

  onNavigateTo(annotation: SupabaseAnnotation): void;

}

export const AnnotationPopup = (props: AnnotationPopupProps) => {
  
  const anno = useAnnotator();

  const store = useAnnotationStore();

  // Popup only supports a single selected annotation for now
  const selected = props.annotation as SupabaseAnnotation;

  const activeLayer = useMemo(() => (
    (props.layers || []).find(l => l.is_active)
  ), [props.layers]);

  const isReadOnly =
    !(selected.layer_id && selected.layer_id === activeLayer?.id);

  const onSaveAnnotation = () =>
    anno.state.selection.clear();

  const onDeleteAnnotation = (annotation: Anno) => 
    store!.deleteAnnotation(annotation);

  const onUpdateAnnotation = (updated: SupabaseAnnotation) =>
    store!.updateAnnotation(updated);

  const onCreateBody = (body: AnnotationBody) =>
    store!.addBody(body);

  const onDeleteBody = (body: AnnotationBody) =>
    store!.deleteBody(body);

  const onBulkDeleteBodies = (bodies: AnnotationBody[]) =>
    // TODO to replace with store.bulkDeleteBodies once supported in Annotorious!
    bodies.forEach(b => store!.deleteBody(b));

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store!.updateBody(oldValue, newValue);

  return (
    <div
      key={selected.id}
      className="annotation-popup not-annotatable">
      <AnnotationCard 
        autoFocus={!isMobile()}
        annotation={selected}
        i18n={props.i18n}
        isProjectLocked={props.isProjectLocked}
        isReadOnly={isReadOnly}
        isSelected
        layers={props.layers}
        layerNames={props.layerNames}
        policies={props.policies}
        present={props.present}
        showReplyField={!isReadOnly}
        tagVocabulary={props.tagVocabulary} 
        onUpdateAnnotation={onUpdateAnnotation}
        onCreateBody={onCreateBody} 
        onDeleteBody={onDeleteBody} 
        onBulkDeleteBodies={onBulkDeleteBodies}
        onUpdateBody={onUpdateBody}
        onDeleteAnnotation={() => onDeleteAnnotation(selected)} 
        onNavigateTo={props.onNavigateTo}
        onSubmit={onSaveAnnotation} />
    </div>
  )
  
}
