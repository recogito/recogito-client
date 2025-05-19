import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AnnotationBody, PresentUser, User } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { Delta } from 'quill/core';
import {
  QuillEditor,
  QuillEditorRoot,
  QuillEditorToolbar,
  isEmpty,
} from '@components/QuillEditor';
import { AuthorAvatar } from './AuthorAvatar';
import { AuthorDetails } from './AuthorDetails';
import { LayerIcon } from './LayerIcon';
import { PrivateAnnotationActions } from './PrivateAnnotationActions';
import { PublicAnnotationActions } from './PublicAnnotationActions';
import { TagList } from './TagList';
import type { Policies, Translations, VocabularyTerm } from 'src/Types';

import './AnnotationCardSection.css';

export interface AnnotationCardSectionProps {
  annotation: SupabaseAnnotation;

  comment?: AnnotationBody;

  emphasizeOnEntry?: boolean;

  i18n: Translations;

  index: number;

  isPrivate?: boolean;

  isProjectLocked?: boolean;

  isReadOnly?: boolean;

  isSelected?: boolean;

  layerNames: Map<string, string>;

  me: User | PresentUser;

  present: PresentUser[];

  policies?: Policies;

  tags?: AnnotationBody[];

  tagVocabulary?: VocabularyTerm[];

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
  body?.value
    ? body.value.length > 0 && body.value.charAt(0) === '{'
      ? JSON.parse(body.value)
      : new Delta().insert(body!.value || '')
    : undefined;

export const AnnotationCardSection = (props: AnnotationCardSectionProps) => {
  const {
    annotation,
    comment,
    index,
    isProjectLocked,
    isPrivate,
    isReadOnly,
    me,
    present,
    tags,
  } = props;

  const { t } = props.i18n;

  const [editable, setEditable] = useState(false);

  const [creator, createdAt] = useMemo(() => {
    const bodiesForThisSection = comment
      ? [comment, ...(tags || [])]
      : tags || [];

    // Shorthand
    const findCreator = (user?: User) =>
      present.find((p) => p.id === user?.id) || user;

    if (bodiesForThisSection.length > 0) {
      // Normal case - section has a comment or tag(s)
      const createdAt =
        bodiesForThisSection[0].created ||
        // Unusual, but may be the case for embedded annotations - if
        // the body doesn't have a timestamp, then fall back to the target creation
        // timestamp for the first body.
        (index === 0 ? annotation.target.created : undefined);
      return [findCreator(bodiesForThisSection[0].creator), createdAt];
    } else {
      // Unusual, but possible. The first section may have
      // 0 comments, 0 tag - but bodies from plugins!
      if (index === 0) {
        const firstAnnotationBody = annotation.bodies[0];
        if (firstAnnotationBody) {
          return [
            findCreator(
              firstAnnotationBody.creator || annotation.target?.creator
            ),
            firstAnnotationBody.created || annotation.target?.created,
          ];
        } else {
          // console.warn('Empty annotation - should never happen', annotation);
          return [undefined, undefined];
        }
      } else {
        console.warn(
          'No comment on reply body - should never happen',
          annotation
        );
        return [undefined, undefined];
      }
    }
  }, [annotation, comment, index, present, tags]);

  // Note that 'me' being undefined caused problems in the past, so we're
  // just being a little defensive here. Context: me is usually derived from
  // the (initialized) Annotorious user, which means it will be undefined
  // until annotations are loaded.
  const isMine = creator?.id === me?.id;

  // Comments are editable if they are mine, or I'm a layer admin
  const canEdit =
    !isReadOnly &&
    (isMine || props.policies?.get('layers').has('INSERT')) &&
    !isProjectLocked;

  const [commentValue, setCommentValue] = useState<Delta | undefined>(
    parseBody(comment)
  );

  useEffect(() => setCommentValue(parseBody(props.comment)), [props.comment]);

  const onDeleteSection = () => {
    const toDelete: AnnotationBody[] = [
      props.comment!,
      ...(props.tags || []),
    ].filter(Boolean);

    props.onBulkDeleteBodies(toDelete);
  };

  const onSave = () => {
    if (commentValue && !isEmpty(commentValue)) {
      // Update existing or create new
      const next = comment
        ? {
            ...comment,
            format: 'Quill',
            value: JSON.stringify(commentValue),
          }
        : {
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
            value: JSON.stringify(commentValue),
          };

      if (comment) props.onUpdateBody(comment, next);
      else props.onCreateBody(next);
    } else {
      if (comment) props.onDeleteBody(comment);
    }

    setEditable(false);

    props.onSubmit();
  };

  const onCreateTag = (value: VocabularyTerm) => {
    const tag: AnnotationBody = {
      id: uuidv4(),
      annotation: props.annotation.id,
      creator: {
        id: me.id,
        name: me.name,
        avatar: me.avatar,
      },
      created: new Date(),
      purpose: 'tagging',
      value: value.id ? JSON.stringify(value) : value.label,
    };

    props.onCreateBody(tag);
  };

  const onCopyLink = () => {
    const withoutHash =
      location.protocol +
      '//' +
      location.hostname +
      (location.port ? ':' + location.port : '') +
      location.pathname +
      (location.search ? location.search : '');

    const link = withoutHash + '#selected=' + annotation.id;
    navigator.clipboard.writeText(link);
  };

  useEffect(() => {
    // Stop editing when annotation is deselected
    if (!props.isSelected) setEditable(false);
  }, [props.isSelected]);

  const className = [
    'annotation-section',
    editable ? 'editable' : undefined,
    props.emphasizeOnEntry ? 'is-new' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={className}>
      <QuillEditorRoot>
        <div className='annotation-header'>
          <div className='annotation-header-left'>
            <AuthorAvatar author={creator} isPrivate={isPrivate} />

            {!editable && (
              <AuthorDetails
                i18n={props.i18n}
                isPrivate={isPrivate}
                creator={creator}
                createdAt={createdAt}
              />
            )}
          </div>

          {editable ? (
            <QuillEditorToolbar i18n={props.i18n} />
          ) : isPrivate ? (
            <div className='annotation-header-right'>
              <PrivateAnnotationActions
                i18n={props.i18n}
                isFirst={props.index === 0}
                onCopyLink={onCopyLink}
                onDeleteAnnotation={props.onDeleteAnnotation}
                onDeleteSection={onDeleteSection}
                onEditSection={() => setEditable(true)}
                onMakePublic={props.onMakePublic}
              />
            </div>
          ) : props.index === 0 && isReadOnly ? (
            <div className='annotation-header-right'>
              <LayerIcon
                i18n={props.i18n}
                layerId={props.annotation.layer_id}
                layerNames={props.layerNames}
              />
            </div>
          ) : (
            (canEdit || props.index === 0) && (
              <div className='annotation-header-right'>
                <PublicAnnotationActions
                  canEdit={canEdit}
                  i18n={props.i18n}
                  isFirst={props.index === 0}
                  isMine={isMine}
                  onCopyLink={onCopyLink}
                  onDeleteAnnotation={props.onDeleteAnnotation}
                  onDeleteSection={onDeleteSection}
                  onEditSection={() => setEditable(true)}
                />
              </div>
            )
          )}
        </div>

        {(commentValue || editable) && (
          <div className='annotation-comment-wrapper'>
            <QuillEditor
              i18n={props.i18n}
              readOnly={!editable}
              value={commentValue}
              onChange={setCommentValue}
            />
          </div>
        )}
      </QuillEditorRoot>

      {props.index === 0 && ((props.tags || []).length > 0 || editable) && (
        <div className='annotation-taglist-wrapper'>
          <TagList
            isEditable={editable}
            i18n={props.i18n}
            tags={props.tags || []}
            vocabulary={props.tagVocabulary}
            onCreateTag={onCreateTag}
            onDeleteTag={props.onDeleteBody}
          />
        </div>
      )}

      {editable && (
        <div className='annotation-section-footer align-right'>
          <button
            className='sm flat unstyled'
            onClick={() => setEditable(false)}
            aria-label={t['cancel editing']}
          >
            {t['Cancel']}
          </button>

          <button
            className='sm flat primary'
            onClick={onSave}
            aria-label={t['save annotation']}
          >
            {t['Save']}
          </button>
        </div>
      )}
    </div>
  );
};
