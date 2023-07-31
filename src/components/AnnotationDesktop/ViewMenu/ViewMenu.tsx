import { useState } from 'react';
import { Chats, MagnifyingGlass, StackSimple, X } from '@phosphor-icons/react';
import { useTransition, animated } from '@react-spring/web'
import { Avatar } from '@components/Avatar';
import { isMe } from '@annotorious/react';
import type { Annotation, Formatter, PresentUser } from '@annotorious/react';
import type { Translations } from 'src/Types';
import { AnnotationList } from '../AnnotationList';
import { ViewMenuPanel } from './ViewMenuPanel';
import { StyleConfiguration } from '../StyleConfiguration';

import './ViewMenu.css';

interface ViewMenuProps {

  i18n: Translations;

  present: PresentUser[];

  beforeSelectAnnotation(a?: Annotation): void;

  onChangePanel(panel?: ViewMenuPanel): void;

  onChangeStyleConfig(formatter?: Formatter): void;

}

export const ViewMenu = (props: ViewMenuProps) => {

  const me = props.present.find(isMe);

  const [panel, _setPanel] = useState<ViewMenuPanel | undefined>();

  const headerTransition = useTransition([panel], {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 140 },
    leave: { opacity: 0, width: 0 }, 
    config: {
      duration: 0
    }
  });

  const panelTransition = useTransition([panel], {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }, 
    config: {
      duration: 100
    }
  });

  const setPanel = (p: ViewMenuPanel | undefined) => {
    _setPanel(p);
    props.onChangePanel(p);
  }

  const togglePanel = (p: ViewMenuPanel) =>
    panel === p ? setPanel(undefined) : setPanel(p);

  return (
    <div 
      className="anno-sidebar-container"
      data-collapsed={panel ? undefined : 'true'}>
      <div 
        className="anno-menubar anno-desktop-overlay view-menu">
        <section>
          <button 
            className={panel === ViewMenuPanel.ANNOTATIONS ? 'active' : undefined}
            onClick={() => togglePanel(ViewMenuPanel.ANNOTATIONS)}>
            <Chats />
          </button>

          <button
            className={panel === ViewMenuPanel.STYLE ? 'active' : undefined}
            onClick={() => togglePanel(ViewMenuPanel.STYLE)}>
            <StackSimple />
          </button>

          <button>
            <MagnifyingGlass />
          </button>
        </section>

        {me && (
          <section>
            <Avatar 
              id={me.id}
              name={me.appearance.label}
              color={me.appearance.color} 
              avatar={me.appearance.avatar} />
          </section>
        )}

        {headerTransition((style, panel) => panel && (
          <animated.section className="close" style={style }>
            <button onClick={() => setPanel(undefined)}>
              <X />
            </button>
          </animated.section>
        ))}
      </div>

      {panel && (
          <aside>
          {panel === ViewMenuPanel.ANNOTATIONS ? (
            <AnnotationList 
              i18n={props.i18n}
              present={props.present} 
              beforeSelect={props.beforeSelectAnnotation} />
          ) : panel === ViewMenuPanel.STYLE ? (
            <StyleConfiguration 
              i18n={props.i18n}
              onChange={props.onChangeStyleConfig} />
          ) : undefined}
        </aside>
      )}
    </div>
  )

}