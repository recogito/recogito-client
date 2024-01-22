import { isMe } from '@recogito/annotorious-supabase';
import { Avatar } from '@components/Avatar';
import { PresenceStack } from '@components/Presence';
import type { PresentUser } from '@annotorious/react';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { 
  ArrowsOutSimple,
  CaretLeft, 
  Chats, 
  GraduationCap, 
  ListBullets, 
  MagnifyingGlassMinus, 
  MagnifyingGlassPlus, 
  NotePencil, 
  StackSimple 
} from '@phosphor-icons/react';

import './Menubar.css';

interface MenubarProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  present: PresentUser[];

}

export const Menubar = (props: MenubarProps) => {

  const { t } = props.i18n;
  
  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const back = contextName ? 
    `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
    `/${props.i18n.lang}/projects/${project_id}`;

  const me = props.present.find(isMe)!;

  return (
    <div className="ia-menubar">
      <div className="ia-menubar-left">
        <div className="ia-menubar-section ia-menubar-title">
          {contextName ? (
            <>
              <a 
                href={back} 
                className="assignment-icon"
                title={t['Back to assignment overview']}>
                <GraduationCap size={20} />
              </a>

              <h1>
                <a href={back}>{contextName}</a> / <span>{props.document.name}</span>
              </h1>
            </>
          ) : (
            <>
              <a 
                href={back} 
                className="back-to-project"
                title={t['Back to project overview']}>
                <CaretLeft size={20} />
              </a>

              <h1>
                <span>{props.document.name}</span>
              </h1>
            </>
          )}
        </div>

        <div className="anno-desktop-overlay-divider" />

        <div>
          <button>
            <ListBullets />
          </button>
        </div>
      </div>

      <div className="ia-menubar-right">
        <div className="ia-menubar-section ia-menubar-zoom">
          <button>
            <MagnifyingGlassPlus />
          </button>

          <button>
            <MagnifyingGlassMinus />
          </button>
        </div>

        {props.present.length > 1 && (
          <>
            <div className="anno-desktop-overlay-divider" />
          
            <div className="ia-menubar-section ia-menubar-presence">
              <PresenceStack present={props.present} />
            </div>
          </>
        )}

        <div className="anno-desktop-overlay-divider" />

        <div className="ia-menubar-section ia-menubar-actions-right">
          <button>
            <Chats />
          </button>

          <button>
            <StackSimple />
          </button>

          <button>
            <NotePencil />
          </button>
        </div>

        <div className="anno-desktop-overlay-divider" />

        <div className="ia-menubar-section ia-menubar-collapse">
          <button>
            <ArrowsOutSimple />
          </button>
        </div>

        {me && (
          <div className="ia-menubar-me">
            <Avatar 
              id={me.id}
              name={me.appearance.label}
              color={me.appearance.color} 
              avatar={me.appearance.avatar} />
          </div>
        )}
      </div>
    </div>
  )

}