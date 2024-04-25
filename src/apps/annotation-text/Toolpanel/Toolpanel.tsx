import { Annotation, useAnnotationStore, useAnnotator, useSelection } from '@annotorious/react';
import { Trash } from '@phosphor-icons/react';
import { PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import type { Translations } from 'src/Types';
// import { AdminOverrideAlert } from '@components/Annotation/Comment/PublicComment/PublicCommentActions';
import { useState } from 'react';

import './Toolpanel.css';

interface ToolbarProps {

  i18n: Translations;

  isAdmin?: boolean;

  privacy: PrivacyMode;

  onChangePrivacy(mode: PrivacyMode): void;

}

export const Toolpanel = (props: ToolbarProps) => {

  const { selected } = useSelection();

  const store = useAnnotationStore();

  const anno = useAnnotator();

  const me = anno?.getUser();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const isMine = (selected: { annotation: Annotation }[]) =>
    selected.every(({ annotation }) => annotation.target.creator?.id === me.id);

  const onRequestDelete = () => {
    setConfirmOpen(true);
  };

  const onDeleteSelection = () =>
    store.bulkDeleteAnnotation(selected.map((s) => s.annotation));

  return (
    <div className='ta-toolpanel-container not-annotatable'>
      <div className='ta-toolpanel-context ta-toolpanel-context-left'></div>

      <div className='anno-desktop-overlay ta-toolbar'>
        <section className='privacy'>
          <PrivacySelector
            mode={props.privacy}
            i18n={props.i18n}
            onChangeMode={props.onChangePrivacy}
          />
        </section>
      </div>

      {!isMine(selected) && (
        <div>{/*
        <AdminOverrideAlert
          i18n={props.i18n}
          open={confirmOpen}
          onConfirm={onDeleteSelection}
          onCancel={() => setConfirmOpen(false)}
        />
        */}</div>
      )}
      {(props.isAdmin || isMine(selected)) && (
        <div
          className={
            selected.length > 0
              ? 'ta-toolpanel-context ta-toolpanel-context-right anno-desktop-overlay'
              : 'ta-toolpanel-context ta-toolpanel-context-right anno-desktop-overlay hidden'
          }
        >
          <button
            className='delete'
            aria-label={props.i18n.t['Delete selected annotation']}
            onClick={isMine(selected) ? onDeleteSelection : onRequestDelete}
          >
            <Trash size={18} />
          </button>
        </div>
      )}
    </div>
  )

}
