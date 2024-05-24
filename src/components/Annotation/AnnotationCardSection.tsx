import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { Delta } from 'quill/core';
import { Extension, usePlugins } from '@components/Plugins';
import { QuillEditor, QuillEditorRoot, isEmpty } from '@components/QuillEditor';
import { AuthorAvatar } from './AuthorAvatar';
import { AuthorDetails } from './AuthorDetails';
import { LayerIcon } from './LayerIcon';
import { PrivateAnnotationActions } from './PrivateAnnotationActions';
import { PublicAnnotationActions } from './PublicAnnotationActions';
import { TagList } from './TagList';
import type { Policies, Translations } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {

  annotation: SupabaseAnnotation;

  isSelected?: boolean;

  comment?: AnnotationBody;

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  index: number;

  isPrivate?: boolean;

  isReadOnly?: boolean;

  layerNames: Map<string, string>;

  me: User | PresentUser;

  present: PresentUser[];

  policies?: Policies;

  tags?: AnnotationBody[];

  tagVocabulary?: string[];
  
  onDeleteAnnotation(): void;

  onCreateBody(body: AnnotationBody): void;

  onDeleteBody(body: AnnotationBody): void;

  onBulkDeleteBodies(bodies: AnnotationBody[]): void;

  onMakePublic(): void;

  onSubmit(): void;

  onUpdateAnnotation(updated: SupabaseAnnotation): void;

  onUpdateBody(oldValue: AnnotationBody, newValue: AnnotationBody): void;

}

const parseBody = (body?: AnnotationBody): Delta | undefined => 
  body?.value ? body.value.length > 0 && body.value.charAt(0) === '{'
      ? JSON.parse(body.value)
      : new Delta().insert(body!.value || '')
  : undefined;

export const AnnotationCardSection = (props: AnnotationCardSectionProps) => {

  const { annotation, comment, index, isPrivate, isReadOnly, me, present, tags } = props;

  const { t } = props.i18n;

  const plugins = usePlugins('annotation.*.annotation-editor');

  const [editable, setEditable] = useState(false);

  const [creator, createdAt] = useMemo(() => {
    const bodiesForThisSection = comment ? 
      [comment, ...(tags || [])] : (tags || []);

    // Shorthand
    const findCreator = (user?: User) =>
      (present.find(p => p.id === user?.id) || user);

    if (bodiesForThisSection.length > 0) {
      // Normal case - section has a comment or tag(s)
      const creatorIds = new Set(bodiesForThisSection.map(b => b.creator?.id));
      if (creatorIds.size > 1)
        console.warn('Integrity problem: content in this section has multiple creators', annotation);

      return [
        findCreator(bodiesForThisSection[0].creator),
        bodiesForThisSection[0].created
      ];
    } else {
      // Unusual, but possible. The first section may have
      // 0 comments, 0 tag - but bodies from plugins!
      if (index === 0) {
        const firstAnnotationBody = annotation.bodies[0];
        if (firstAnnotationBody) {
          return [
            findCreator(firstAnnotationBody.creator || annotation.target?.creator),
            firstAnnotationBody.created || annotation.target?.created,
          ];
        } else {
          console.warn('Empty annotation - should never happen', annotation);
          return [undefined, undefined];
        }
      } else {
        console.warn('No comment on reply body - should never happen', annotation);
        return [undefined, undefined];
      }
    }    
  }, [annotation, comment, index, present, tags]);

  const isMine = creator?.id === me.id;

  // Comments are editable if they are mine, or I'm a layer admin
  const canEdit = !isReadOnly && (isMine || props.policies?.get('layers').has('INSERT'));

  const [commentValue, setCommentValue] = useState<Delta | undefined>(parseBody(comment));

  useEffect(() => setCommentValue(parseBody(props.comment)), [props.comment]);

  const onDeleteSection = () => {
    const toDelete: AnnotationBody[] = [
      props.comment!,
      ...(props.tags || [])
    ].filter(Boolean);

    props.onBulkDeleteBodies(toDelete);
  }

  const onSave = () => {   
    if (commentValue && !isEmpty(commentValue)) {
      // Update existing or create new
      const next = comment ? {
        ...comment,
        format: 'Quill',
        value: JSON.stringify(commentValue)
      } : {
        id: uuidv4(),
        annotation: props.annotation.id,
        creator: {
          id: props.me.id,
          name: props.me.name,
          avatar: props.me.avatar,
        },
        created: new Date(),
        purpose: 'commenting',
        format: 'Quill',
        value: JSON.stringify(commentValue)
      }
      
      if (comment)
        props.onUpdateBody(comment, next);
      else
        props.onCreateBody(next);
    } else {
      if (comment)
        props.onDeleteBody(comment);
    }

    setEditable(false);

    props.onSubmit();
  }

  const onCreateTag = (value: string) => {
    const tag: AnnotationBody = {
      id: uuidv4(),
      annotation: props.annotation.id,
      creator: {  
        id: me.id,
        name: me.name,
        avatar: me.avatar
      },
      created: new Date(),
      purpose: 'tagging',
      value
    };

    props.onCreateBody(tag);
  }

  useEffect(() => {
    // Stop editing when annotation is deselected
    if (!props.isSelected)
      setEditable(false);
  }, [props.isSelected]);

  const className = [
    'annotation-section',
    editable ? 'editable' : undefined,
    props.emphasizeOnEntry ? 'is-new' : undefined 
  ].filter(Boolean).join(' ');

  return (
    <div className={className}>
      <div className="annotation-header">
        <div className="annotation-header-left">
          <AuthorAvatar 
            author={creator}
            isPrivate={isPrivate} />

          <AuthorDetails 
            i18n={props.i18n}
            isPrivate={isPrivate} 
            creator={creator}
            createdAt={createdAt} />
        </div>

        {canEdit ? (
          <div className="annotation-header-right">
            {isPrivate ? (
              <PrivateAnnotationActions
                i18n={props.i18n} 
                isFirst={props.index === 0}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteSection={onDeleteSection}
                onEditSection={() => setEditable(true)}
                onMakePublic={props.onMakePublic}/>
            ) : (
              <PublicAnnotationActions 
                i18n={props.i18n} 
                isFirst={props.index === 0} 
                isMine={isMine}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteSection={onDeleteSection}
                onEditSection={() => setEditable(true)} />
            )}    
          </div>
        ) : (props.index === 0 && isReadOnly) && (
          <div className="annotation-header-right">
            <LayerIcon 
              i18n={props.i18n}
              layerId={props.annotation.layer_id}
              layerNames={props.layerNames} />
          </div>
        )}
      </div>

      {(commentValue || editable) && (
        <div className="annotation-comment-wrapper">
          <QuillEditorRoot>
            <QuillEditor 
              i18n={props.i18n}
              readOnly={!editable}
              value={commentValue} 
              onChange={setCommentValue} />
          </QuillEditorRoot>
        </div>
      )}

      {(props.index === 0 && ((props.tags || []).length > 0 || editable)) && (
        <div className="annotation-taglist-wrapper">
          <TagList 
            isEditable={editable}
            i18n={props.i18n}
            tags={props.tags || []}
            vocabulary={props.tagVocabulary}
            onCreateTag={onCreateTag}
            onDeleteTag={props.onDeleteBody} />
        </div>
      )}

      {editable && (
          <div className="annotation-section-footer align-right">
            <button 
              className="sm flat unstyled"
              onClick={() => setEditable(false)}>
              {t['Cancel']}
            </button>

            <button 
              className="sm flat primary"
              onClick={onSave}>
              {t['Save']}
            </button>
          </div>
      )}

      {props.index === 0 ? plugins.map(plugin => (
        <Extension 
          key={plugin.meta.id}
          annotation={props.annotation} 
          extensionPoint="annotation.*.annotation-editor"
          isEditable={editable}
          isSelected={props.isSelected}
          me={me}
          plugin={plugin}
          onUpdateAnnotation={props.onUpdateAnnotation} />
      )) : null}
    </div>
  )

}