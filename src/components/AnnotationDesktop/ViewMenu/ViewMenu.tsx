import { ReactNode, useState } from 'react';
import { Chats, MagnifyingGlass, StackSimple, X } from '@phosphor-icons/react';
import { useTransition, animated } from '@react-spring/web'
import { Avatar } from '@components/Avatar';
import { isMe } from '@annotorious/react';
import type { PresentUser } from '@annotorious/react';
import { AnnotationList } from '../AnnotationList';
import type { Translations } from 'src/Types';

import './ViewMenu.css';

interface ViewMenuProps {

  i18n: Translations;

  present: PresentUser[];

}

export const ViewMenu = (props: ViewMenuProps) => {

  const me = props.present.find(isMe);

  const [panel, setPanel] = useState<ReactNode | undefined>();

  const headerTransition = useTransition([panel], {
    from: { opacity: 0, width: 0 },
    enter: { opacity: 1, width: 140 },
    leave: { opacity: 0, width: 0 }, 
    config: {
      duration: 125
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

  const showAnnotationList = () => panel ? setPanel(undefined) : setPanel(
    <AnnotationList
      i18n={props.i18n} 
      present={props.present} />
  );

  return (
    <div 
      className="anno-sidebar-container"
      data-collapsed={panel ? undefined : 'true'}>
      <div 
        className="anno-menubar anno-desktop-overlay view-menu">
        <section>
          <button onClick={showAnnotationList}>
            <Chats />
          </button>

          <button>
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

      {panelTransition((style, panel) => panel && (
        <animated.aside style={style}>
          {panel}
        </animated.aside>
      ))}
    </div>
  )

}