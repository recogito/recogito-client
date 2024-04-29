import { useMemo } from 'react';
import { type AnnotationBody, useAnnotationStore, useAnnotator, useAnnotatorUser } from '@annotorious/react';
import type { Annotation as Anno, PresentUser, User } from '@annotorious/react';
import { SupabaseAnnotation, Visibility } from '@recogito/annotorious-supabase';
import { Extension, usePlugins } from '@components/Plugins';
import { AnnotationCard, EmptyAnnotation } from '@components/Annotation';
import type { Layer, Policies, Translations } from 'src/Types';

import './AnnotationPopup.css';

interface AnnotationPopupProps {

  selected: { annotation: Anno; editable?: boolean }[];

  i18n: Translations;

  layers?: Layer[];

  present: PresentUser[];

  policies?: Policies;

  tagVocabulary?: string[];

}

export const AnnotationPopup = (props: AnnotationPopupProps) => {
  
  const anno = useAnnotator();

  const user = useAnnotatorUser();

  const store = useAnnotationStore();

  const plugins = usePlugins('annotation.*.annotation-editor');

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  const activeLayer = useMemo(() => (
    (props.layers || []).find(l => l.is_active)
  ), [props.layers]);

  // Popup only supports a single selected annotation for now
  const selected = props.selected[0].annotation as SupabaseAnnotation;

  const isPrivate = selected.visibility === Visibility.PRIVATE;

  const isMine = selected.target.creator?.id === me.id;

  const isReadOnly =
    !(selected.layer_id && selected.layer_id === activeLayer?.id);

  const hasBodies = selected.bodies.length > 0;

  // Close the popup after a reply
  const onReply = (body: AnnotationBody) => {
    store.addBody(body);
    anno.state.selection.clear();
  }

  const onDeleteAnnotation = (annotation: Anno) => 
    store.deleteAnnotation(annotation);

  const onUpdateAnnotation = (updated: SupabaseAnnotation) =>
    store.updateAnnotation(updated);

  const onCreateBody = (body: AnnotationBody) =>
    store.addBody(body);

  const onDeleteBody = (body: AnnotationBody) =>
    store.deleteBody(body);

  const onBulkDeleteBodies = (bodies: AnnotationBody[]) =>
    // TODO to replace with store.bulkDeleteBodies once supported in Annotorious!
    bodies.forEach(b => store.deleteBody(b));

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store.updateBody(oldValue, newValue);

  return (
    <div
      key={selected.id}
      className="annotation-popup not-annotatable">
      {hasBodies ? (
        <AnnotationCard 
          annotation={selected}
          i18n={props.i18n}
          isReadOnly={isReadOnly}
          present={props.present}
          showReplyField={!isReadOnly}
          tagVocabulary={props.tagVocabulary} 
          onReply={onCreateBody}
          onUpdateAnnotation={onUpdateAnnotation}
          onCreateBody={onCreateBody} 
          onDeleteBody={onDeleteBody} 
          onBulkDeleteBodies={onBulkDeleteBodies}
          onUpdateBody={onUpdateBody}
          onDeleteAnnotation={() => onDeleteAnnotation(selected)} />
      ) : isMine ? (
        <EmptyAnnotation 
          annotation={selected} 
          i18n={props.i18n}
          me={me} 
          onCreateBody={onCreateBody} 
          onDeleteBody={onDeleteBody} />   
      ) : (
        <div>{/* 
        <EmptyAnnotation 
          typing
          selected={isSelected(a)}
          i18n={props.i18n} 
          annotation={a} 
          present={props.present} /> */}</div>   
      )}
    </div>
  );
};
