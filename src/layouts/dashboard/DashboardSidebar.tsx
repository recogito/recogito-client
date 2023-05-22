import { ArrowUpRight, SignOut } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './DashboardSidebar.css';

export const DashboardSidebar = (props: { i18n: Translations }) => {

  const { i18n } = props;

  return (
    <aside className="dashboard-sidebar">
      <h1>{i18n['Dashboard']}</h1>
      <nav>
        <ul>
          <li>
            <h2>{i18n['Projects']}</h2>
            <ul>
              <li>
                <a href="./projects">{i18n['All projects']}</a>
              </li>
            </ul>
          </li>

          <li>
            <h2>{i18n['Account']}</h2>
            <ul>
              <li>
                <a href="./account/me">{i18n['Preferences']}</a>
              </li>
            </ul>
          </li>
          
          <li>
            <h2>{i18n['Documentation']}</h2>
            <ul>
              <li>
                <a href="./help/tutorial">
                  <ArrowUpRight className="text-bottom" size={17} /> {i18n['Tutorial']}
                </a>
              </li>
              
              <li>
                <a href="./helo/faq">
                  <ArrowUpRight className="text-bottom" size={17} /> {i18n['FAQ']}
                </a>
              </li>
            </ul>
          </li>

          <li>
            <ul className="pad">
              <li>
                <a href="./sign-out">
                  <SignOut className="text-bottom" size={19} /> {i18n['Logout']}
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  )  

}