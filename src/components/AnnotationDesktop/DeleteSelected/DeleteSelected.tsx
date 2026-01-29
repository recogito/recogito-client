import { useMemo, useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { useAnnotationStore, useAnnotatorUser, useSelection } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { AdminOverrideAlert } from '@components/AnnotationDesktop';
import type { DocumentLayer, Policies } from 'src/Types';
import { useTranslation } from 'react-i18next';

import './DeleteSelected.css';

interface DeleteSelectedProps {

  policies?: Policies;

  activeLayer?: DocumentLayer;

}

export const DeleteSelected = (props: DeleteSelectedProps) => {

  const { t } = useTranslation(['annotation-common']);

  const me = useAnnotatorUser();

  const store = useAnnotationStore();

  const { selected } = useSelection();

  const [promptOverride, setPromptOverride] = useState(false);

  const isMine = useMemo(() => (
    selected.every(({ annotation }) => annotation.target.creator?.id === me.id)
  ), [selected, me]);

  const isReadOnly = useMemo(() => (
    selected.some(({ annotation }) => (annotation as SupabaseAnnotation).layer_id !== props.activeLayer?.id)
  ), [selected, props.activeLayer]);

  const isAdmin = props.policies?.get('layers').has('INSERT');

  const isDeletable = 
    // there is a selection
    selected?.length > 0 &&
    // only my own annotations, or I'm admin 
    (isMine || isAdmin) && 
    // none of the selected annotations is read-only
    !isReadOnly;

  const onDeleteSelection = () =>
    store!.bulkDeleteAnnotations(selected.map((s) => s.annotation));

  return isDeletable && (
    <>
      {!isMine && (
        <AdminOverrideAlert
          open={promptOverride}
          onConfirm={onDeleteSelection}
          onCancel={() => setPromptOverride(false)}
        />
      )}

      <div className='anno-toolbar-divider' />

      <button
        className='delete-selected'
        aria-label={t('Delete selected annotation', { ns: 'annotation-common' })}
        onClick={isMine ? onDeleteSelection : () => setPromptOverride(true)}>
        <Trash size={18} />
      </button>
    </>
  )

}