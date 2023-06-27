import { ArrowUpRight, SignOut } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './DashboardSidebar.css';
import { useEffect, useState } from 'react';
import { retrievePendingInvites } from '@backend/crud';
import { getMyProfile } from '@backend/crud/profiles';

import { supabase } from '@backend/supabaseBrowserClient';
import NotificationIcon from '@components/Notification/Notification';

/**
 * Note that we're using React to render this (otherwise static) component rather
 * than Astro for convenience. This way, we only need to have the React version
 * of Phosphor Icons as a depdency. (Plus: icons also look slightly different between
 * React and Astro versions!)
 */
export const DashboardSidebar = (props: { i18n: Translations }) => {

  const { lang, t } = props.i18n;

  const [ pending, setPending ] = useState(0);

  useEffect(() => {
    retrievePendingInvites(supabase).then((count) => {
      if (count) {
        setPending(count)
      }
    });
  });

  return (
    <aside className="dashboard-sidebar">
      <h1>{t['Dashboard']}</h1>
      <nav>
        <ul>
          <li>
            <h2>{t['Projects']}</h2>
            { pending > 0 && (
              <NotificationIcon count={pending} />
            )}
            <ul>
              <li>
                <a href={`/${lang}/projects`}>{t['All projects']}</a>
              </li>
            </ul>
          </li>

          <li>
            <h2>{t['Account']}</h2>
            <ul>
              <li>
                <a href={`/${lang}/account/me`}>{t['Preferences']}</a>
              </li>
            </ul>
          </li>
          
          <li>
            <h2>{t['Documentation']}</h2>
            <ul>
              <li>
                <a href="./help/tutorial">
                  <ArrowUpRight className="text-bottom" size={17} /> {t['Tutorial']}
                </a>
              </li>
              
              <li>
                <a href="./help/faq">
                  <ArrowUpRight className="text-bottom" size={17} /> {t['FAQ']}
                </a>
              </li>
            </ul>
          </li>

          <li>
            <ul className="pad">
              <li>
                <a href={`/${lang}/sign-out`}>
                  <SignOut className="text-bottom" size={19} /> {t['Logout']}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  )  

}