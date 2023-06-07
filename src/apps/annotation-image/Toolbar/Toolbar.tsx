import { useEffect, useState } from 'react';
import { useAnnotationStore, useAnnotator, useSelection } from '@annotorious/react';
import { Polygon, Rectangle } from './Icons';
import { Cursor, Trash } from '@phosphor-icons/react';
import { PrivacyMode, PrivacySelector } from '@components/PrivacySelector';
import type { Translations } from 'src/Types';

interface ToolbarProps {

  i18n: Translations;

  onChangeTool(tool: string | null): void;

}

export const Toolbar = (props: ToolbarProps) => {

  const selection = useSelection();

  const store = useAnnotationStore();

  const anno = useAnnotator();

  const [tool, setTool] = useState<string>('cursor');

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const onChangeTool = (tool: string) => {
    props.onChangeTool && props.onChangeTool(tool === 'cursor' ? null : tool);
    setTool(tool);
  }

  const onDeleteSelection = () => {
    store.bulkDeleteAnnotation(selection);
  }

  useEffect(() => {
    if (anno) {
      // Switch back to nav mode after annotation was created
      const onCreate = () => onChangeTool('cursor');

      anno.on('createAnnotation', onCreate);

      return () => {
        anno.off('createAnnotation', onCreate);
      }
    }
  }, [anno]);

  return (
    <div className="ia-toolbar-container">
      <div className="ia-toolbar-context ia-toolbar-context-left">
        
      </div>

      <div className="anno-desktop-overlay ia-toolbar">
        <section>
          <button 
            className={tool === 'cursor' ? 'active' : undefined}
            onClick={() => onChangeTool('cursor')}>
            <Cursor size={18} />
          </button>

          <button 
            className={tool === 'box' ? 'active' : undefined}
            onClick={() => onChangeTool('box')}>
            <Rectangle />
          </button>

          <button 
            className={tool === 'polygon' ? 'active' : undefined}
            onClick={() => onChangeTool('polygon')}>
            <Polygon />
          </button>
        </section>

        <div className="anno-desktop-overlay-divider" />

        <section className="privacy">
          <PrivacySelector 
            mode={privacy}
            i18n={props.i18n} 
            onChangeMode={setPrivacy}/>
        </section>
      </div>

      <div 
        className={selection.length > 0 ? 
          "ia-toolbar-context ia-toolbar-context-right anno-desktop-overlay" :
          "ia-toolbar-context ia-toolbar-context-right anno-desktop-overlay hidden"
        }>
        <button onClick={onDeleteSelection}>
          <Trash size={16} />
        </button>
      </div>
    </div>
  )

}