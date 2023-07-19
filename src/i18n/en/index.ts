import annotationCommon from './annotation-common.json';
import annotationImage from './annotation-image.json';
import annotationText from './annotation-text.json';
import authLogin from './auth-login.json';
import dashboardAccount from './dashboard-account.json';
import dashboardProjects from './dashboard-projects.json';
import dashboardSidebar from './dashboard-sidebar.json';
import dashboardNotifications from './dashboard-notifications.json';
import error from './error.json';
import projectCollaboration from './project-collaboration.json';
import projectHome from './project-home.json';
import projectSidedbar from './project-sidebar.json';

export default {
  'annotation-image': {...annotationCommon, ...annotationImage},
  'annotation-text': { ...annotationCommon, ...annotationText },
  'auth-login': authLogin,
  'dashboard-account': { ...dashboardAccount, ...dashboardSidebar },
  'dashboard-notifications': { ...dashboardNotifications, ...dashboardSidebar },
  'dashboard-projects': { ...dashboardProjects, ...dashboardSidebar },
  'dashboard-sidebar': dashboardSidebar,
  'error': error,
  'project-collaboration': projectCollaboration,
  'project-home': projectHome,
  'project-sidebar': projectSidedbar
}