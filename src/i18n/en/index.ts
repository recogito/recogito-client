import accountMenu from './account-menu.json';
import annotationCommon from './annotation-common.json';
import annotationImage from './annotation-image.json';
import annotationText from './annotation-text.json';
import authForgotPassword from './auth-forgot-password.json';
import authLogin from './auth-login.json';
import authResetPassword from './auth-reset-password.json';
import branding from './branding.json';
import collectionManagement from './collection-management.json';
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
import a11y from './a11y.json';

export default {
  'annotation-common': { ...annotationCommon, ...a11y },
  'annotation-image': {
    ...annotationCommon,
    ...annotationImage,
    ...accountMenu,
    ...a11y,
    ...notifications,
  },
  'annotation-text': {
    ...annotationCommon,
    ...annotationText,
    ...accountMenu,
    ...a11y,
    ...notifications,
  },
  'auth-forgot-password': { ...authForgotPassword, ...a11y },
  'auth-login': { ...authLogin, ...a11y },
  'auth-reset-password': { ...authResetPassword, ...a11y },
  branding: { ...branding, a11y },
  'collection-management': {
    ...projectHome,
    ...projectSidedbar,
    ...accountMenu,
    ...notifications,
    ...collectionManagement,
    ...a11y,
  },
  'dashboard-account': { ...dashboardAccount, ...accountMenu, ...a11y },
  'dashboard-projects': {
    ...dashboardProjects,
    ...notifications,
    ...accountMenu,
    ...a11y,
  },
  error: { ...error, ...a11y },
  'project-assignment-details': { ...projectAssignmentDetails, ...a11y },
  'project-assignments': { ...projectAssignments, ...a11y },
  'project-collaboration': {
    ...projectCollaboration,
    ...accountMenu,
    ...a11y,
    ...notifications,
  },
  'project-home': {
    ...projectHome,
    ...accountMenu,
    ...notifications,
    ...projectSidedbar,
    ...projectAssignments,
    ...a11y,
  },
  'project-settings': {
    ...projectSettings,
    ...dashboardProjects,
    ...accountMenu,
    ...notifications,
    ...a11y,
  },
  'project-sidebar': { ...projectSidedbar, ...accountMenu, ...a11y },
  'user-management': { ...userManagement, ...accountMenu, ...a11y },
  'project-request': { ...projectRequest, ...accountMenu, ...a11y },
  email: { ...email, ...a11y },
};
