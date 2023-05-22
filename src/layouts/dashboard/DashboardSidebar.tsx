import { ArrowUpRight, SignOut } from '@phosphor-icons/react';

import './DashboardSidebar.css';

export const DashboardSidebar = () => {

  return (
    <aside className="dashboard-sidebar">
      <h1>Dashboard</h1>
      <nav>
        <ul>
          <li>
            <h2>Projects</h2>
            <ul>
              <li>
                <a href="./projects">All projects</a>
              </li>
            </ul>
          </li>

          <li>
            <h2>Account</h2>
            <ul>
              <li>
                <a href="./account/me">Preferences</a>
              </li>
            </ul>
          </li>
          
          <li>
            <h2>Documentation</h2>
            <ul>
              <li>
                <a href="./help/tutorial">
                  <ArrowUpRight className="text-bottom" size={17} /> Tutorial
                </a>
              </li>
              
              <li>
                <a href="./helo/faq">
                  <ArrowUpRight className="text-bottom" size={17} /> FAQ
                </a>
              </li>
            </ul>
          </li>

          <li>
            <ul className="pad">
              <li>
                <a href="./sign-out">
                  <SignOut className="text-bottom" size={19} /> Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  )  

}