import { ArrowUpRight, SignOut } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './DashboardSidebar.css';
import { useEffect, useState } from 'react';
import { retrievePendingInvites } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import NotificationIcon from '@components/NotificationIcon/NotificationIcon';
import { getMyProfile } from '@backend/crud/profiles';

/**
 * Note that we're using React to render this (otherwise static) component rather
 * than Astro for convenience. This way, we only need to have the React version
 * of Phosphor Icons as a depdency. (Plus: icons also look slightly different between
 * React and Astro versions!)
 */
export const DashboardSidebar = (props: { i18n: Translations }) => {

  const [ pending, setPending ] = useState(0);

  useEffect(() => {
    getMyProfile(supabase).then((user) => {retrievePendingInvites(supabase, user.data.email).then((count) => count && setPending(count));});
  }, []);

  const { lang, t } = props.i18n;

  return (
    <aside className="dashboard-sidebar">
      <h1>{t['Dashboard']}</h1>
      <nav>
        <ul style={{ display: 'flex', flexDirection: 'column' }}>
          <li>
            <div className="section">
              <h2><a href={`/${lang}/projects`}>{t['Projects']}</a></h2>
            </div>
          </li>
          <li>
            <div className={`section flexrow`} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <h2><a href={`/${lang}/notifications`}>{t['Notifications']}</a></h2>
              { pending > 0 && (
                <NotificationIcon count={pending} />
              )}
            </div>
          </li>
          <li>
            <div className='section'>
              <h2><a href={`/${lang}/account/me`}>{t['Account Preferences']}</a></h2>
            </div>
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