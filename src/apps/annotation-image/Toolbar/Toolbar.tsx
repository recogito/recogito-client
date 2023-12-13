import { useState } from 'react';
import { Annotation, useAnnotationStore, useAnnotator, useSelection } from '@annotorious/react';
import { Polygon, Rectangle } from './Icons';
import { Cursor, Trash } from '@phosphor-icons/react';
import { PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import type { Translations } from 'src/Types';

interface ToolbarProps {

  i18n: Translations;

  isAdmin: boolean;

  privacy: PrivacyMode;

  onChangeTool(tool: string | null): void;

  onChangePrivacy(mode: PrivacyMode): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const { t } = props.i18n;

  const { selected } = useSelection();

  const store = useAnnotationStore();

  const anno = useAnnotator();

  const me = anno?.getUser();

  const [tool, setTool] = useState<string>('cursor');

  const onChangeTool = (tool: string) => {
    props.onChangeTool && props.onChangeTool(tool === 'cursor' ? null : tool);
    setTool(tool);
  }

  const onDeleteSelection = () =>
    store.bulkDeleteAnnotation(selected.map(s => s.annotation));

  const isMine = (selected: { annotation: Annotation }[]) =>
    selected.every(({ annotation }) =>
      annotation.target.creator?.id === me.id);

  return (
    <div className="ia-toolbar-container">
      <div className="ia-toolbar-context ia-toolbar-context-left">
        
      </div>

      <div className="anno-desktop-overlay ia-toolbar">
        <section>
          <button 
            className={tool === 'cursor' ? 'active' : undefined}
            aria-label={t['Pan and zoom the image, select annotations']}
            onClick={() => onChangeTool('cursor')}>
            <Cursor size={18} />
          </button>

          <button 
            className={tool === 'rectangle' ? 'active' : undefined}
            aria-label={t['Create rectangle annotations']}
            onClick={() => onChangeTool('rectangle')}>
            <Rectangle />
          </button>

          <button 
            className={tool === 'polygon' ? 'active' : undefined}
            aria-label={t['Create polygon annotations']}
            onClick={() => onChangeTool('polygon')}>
            <Polygon />
          </button>
        </section>

        <div className="anno-desktop-overlay-divider" />

        <section className="privacy">
          <PrivacySelector 
            mode={props.privacy}
            i18n={props.i18n} 
            onChangeMode={props.onChangePrivacy}/>
        </section>
      </div>

      {(props.isAdmin || isMine(selected)) && (
        <div 
          className={selected.length > 0 ? 
            "ia-toolbar-context ia-toolbar-context-right anno-desktop-overlay" :
            "ia-toolbar-context ia-toolbar-context-right anno-desktop-overlay hidden"
          }>
          <button 
            className="delete" 
            aria-label={t['Delete selected annotation']}
            onClick={onDeleteSelection}>
            <Trash size={18} />
          </button>
        </div>
      )}
    </div>
  )

}