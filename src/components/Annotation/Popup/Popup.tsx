import { type AnnotationBody, useAnnotationStore, useAnnotator, useAnnotatorUser } from '@annotorious/react';
import type { Annotation as Anno, PresentUser, User } from '@annotorious/react';
import { SupabaseAnnotation, Visibility } from '@recogito/annotorious-supabase';
import { Annotation } from '@components/Annotation';
import { Extension, usePlugins } from '@components/Plugins';
import { TagsWidget } from '../TagsWidget';
import type { Policies, Translations } from 'src/Types';

import './Popup.css';

interface PopupProps {
  selected: { annotation: Anno; editable?: boolean }[];

  i18n: Translations;

  present: PresentUser[];

  policies?: Policies;

  tagVocabulary?: string[];
}

export const Popup = (props: PopupProps) => {
  
  const anno = useAnnotator();

  const user = useAnnotatorUser();

  const store = useAnnotationStore();

  const plugins = usePlugins('annotation.*.annotation-editor');

  const me: PresentUser | User = props.present.find(p => p.id === user.id) || user;

  // Popup only supports a single selected annotation for now
  const selected = props.selected[0].annotation as SupabaseAnnotation;

  const isPrivate = selected.visibility === Visibility.PRIVATE;

  const isMine = selected.target.creator?.id === me.id;

  const hasComments = 
    selected.bodies.filter(b => b.purpose === 'commenting' || b.purpose === 'replying').length > 0;

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

  const onUpdateBody = (oldValue: AnnotationBody, newValue: AnnotationBody) => 
    store.updateBody(oldValue, newValue);

  return (
    <div
      key={selected.id}
      className={
        isPrivate
          ? 'annotation-popup private not-annotatable'
          : 'annotation-popup not-annotatable'
      }
    >
      {hasComments ? (
        isPrivate ? (
          <Annotation.PrivateCard
            {...props}
            showReplyForm
            annotation={selected} 
            onReply={onReply} 
            onDeleteAnnotation={() => onDeleteAnnotation(selected)}
            onUpdateAnnotation={onUpdateAnnotation}
            onCreateBody={onCreateBody} 
            onDeleteBody={onDeleteBody} 
            onUpdateBody={onUpdateBody} />
        ) : (
          <Annotation.PublicCard
            {...props}
            showReplyForm
            annotation={selected}
            policies={props.policies}
            onReply={onReply} 
            onDeleteAnnotation={() => onDeleteAnnotation(selected)}
            onUpdateAnnotation={onUpdateAnnotation}
            onCreateBody={onCreateBody} 
            onDeleteBody={onDeleteBody}
            onUpdateBody={onUpdateBody} />
        )
      ) : isMine ? (
        isPrivate ? (
          <div className='annotation-card private'>
            <TagsWidget
              i18n={props.i18n}
              me={me}
              annotation={selected}
              vocabulary={props.tagVocabulary} 
              onCreateTag={onCreateBody} 
              onDeleteTag={onDeleteBody} />

            <Annotation.ReplyForm
              {...props}
              autofocus
              me={me}
              annotation={selected}
              placeholder={props.i18n.t['Comment...']}
              onSubmit={onReply}
            />

            {plugins.map(plugin => (
              <Extension 
                key={plugin.meta.id}
                plugin={plugin} 
                extensionPoint="annotation.*.annotation-editor"
                me={me}
                annotation={selected} 
                onUpdateAnnotation={onUpdateAnnotation} />
            ))}
          </div>
        ) : (
          <div className='annotation-card'>
            <TagsWidget
              i18n={props.i18n}
              me={me}
              annotation={selected}
              vocabulary={props.tagVocabulary}
              onCreateTag={onCreateBody} 
              onDeleteTag={onDeleteBody} />

            <Annotation.ReplyForm
              {...props}
              autofocus
              me={me}
              annotation={selected}
              placeholder={props.i18n.t['Comment...']}
              onSubmit={onReply}
            />

            {plugins.map(plugin => (
              <Extension 
                key={plugin.meta.id}
                plugin={plugin} 
                extensionPoint="annotation.*.annotation-editor"
                me={me}
                annotation={selected} 
                onUpdateAnnotation={onUpdateAnnotation} />
            ))}
          </div>
        )
      ) : (
        <Annotation.EmptyCard
          {...props}
          typing
          annotation={selected}
          selected
        />
      )}
    </div>
  );
};
