import accountMenu from './account-menu.json';
import annotationCommon from './annotation-common.json';
import annotationImage from './annotation-image.json';
import annotationText from './annotation-text.json';
import authForgotPassword from './auth-forgot-password.json';
import authLogin from './auth-login.json';
import authResetPassword from './auth-reset-password.json';
import branding from './branding.json';
import dashboardAccount from './dashboard-account.json';
import dashboardProjects from './dashboard-projects.json';
import error from './error.json';
import notifications from './notifications.json';
import projectAssignmentDetails from './project-assignment-details.json';
import projectAssignments from './project-assignments.json';
import projectCollaboration from './project-collaboration.json';
import projectHome from './project-home.json';
import projectSettings from './project-settings.json';
import projectSidedbar from './project-sidebar.json';
import userManagement from './user-management.json';
import projectRequest from './project-request.json';
import email from './email.json';

export default {
  'annotation-image': {
    ...annotationCommon,
    ...annotationImage,
    ...accountMenu,
  },
  'annotation-text': { ...annotationCommon, ...annotationText, ...accountMenu },
  'auth-forgot-password': authForgotPassword,
  'auth-login': authLogin,
  'auth-reset-password': authResetPassword,
  'branding': branding,
  'dashboard-account': { ...dashboardAccount, ...accountMenu },
  'dashboard-projects': {
    ...dashboardProjects,
    ...notifications,
    ...accountMenu,
  },
  error: error,
  'project-assignment-details': projectAssignmentDetails,
  'project-assignments': projectAssignments,
  'project-collaboration': { ...projectCollaboration, ...accountMenu },
  'project-home': {
    ...{ ...projectHome, ...accountMenu, ...projectSidedbar },
    ...accountMenu,
    ...projectSidedbar,
    ...projectAssignments,
  },
  'project-settings': {
    ...projectSettings,
    ...dashboardProjects,
    ...accountMenu,
  },
  'project-sidebar': { ...projectSidedbar, ...accountMenu },
  'user-management': { ...userManagement, ...accountMenu },
  'project-request': { ...projectRequest, ...accountMenu },
  email: email,
};
