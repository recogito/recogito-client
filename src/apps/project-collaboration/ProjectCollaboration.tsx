import { useState } from 'react';
import { Toast, ToastProvider } from '@components/Toast';
import type { ToastContent } from '@components/Toast';
import { InviteUserDialog } from './InviteUserDialog';
import { MembersTable } from './MembersTable';
import { JoinRequestsTable } from './JoinRequestsTable';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Group,
  Member,
  JoinRequest,
} from 'src/Types';
import { TopBar } from '@components/TopBar';
import { BackButtonBar } from '@components/BackButtonBar';
import * as Switch from '@radix-ui/react-switch';
import { acceptJoinRequest, ignoreJoinRequest } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { formatName } from '@components/Avatar';
import { Button } from '@components/Button';
import { InfoTooltip } from '@components/InfoTooltip';
import { inviteUsersToProject } from '@backend/crud';
import {
  InviteListOfUsersDialog,
  type InviteListEntry,
} from './InviteListOfUsersDialog';
import { DropdownButton } from '@components/DropdownButton';
import { UserPlus, User, UsersFour } from '@phosphor-icons/react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

import './ProjectCollaboration.css';

interface ProjectCollaborationProps {

  project: ExtendedProjectData;

  projects: ExtendedProjectData[];

  invitations: Invitation[];

  requests: JoinRequest[];

  me: MyProfile;

  user: MyProfile;
}

const ProjectCollaboration = (props: ProjectCollaborationProps) => {
  const { t, i18n } = useTranslation(['common', 'project-collaboration', 'annotation-common', 'a11y']);

  const [project, setProject] = useState(props.project);

  const [invitations, setInvitations] = useState(props.invitations);

  const [requests, setRequests] = useState(props.requests);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [showIgnored, setShowIgnored] = useState(false);

  const [addUserOpen, setAddUserOpen] = useState(false);

  const [addUsersOpen, setAddUsersOpen] = useState(false);

  const onChangeGroup = (member: Member, from: Group, to: Group) => {
    // Update member
    const updated = {
      ...member,
      inGroup: to,
    };

    // Update project groups
    setProject((project) => ({
      ...project,
      users: project.users.map((u) => {
        if (u.user.id === member.user.id) {
          return {
            ...u,
            inGroup: to,
          };
        } else {
          return u;
        }
      }),
      groups: project.groups.map((group) =>
        group.id === from.id
          ? // Remove user from this group
            {
              ...group,
              members: group.members.filter(
                (m) => m.user.id !== member.user.id
              ),
            }
          : group.id === to.id
          ? // Add user to this group
            { ...group, members: [...group.members, updated] }
          : group
      ),
    }));
  };

  const onDeleteMember = (member: Member) => {
    // Remove user from this project
    setProject((project) => ({
      ...project,
      users: project.users.filter((u) => u.user.id !== member.user.id),
      groups: project.groups.map((group) => ({
        ...group,
        members: group.members.filter((m) => m.user.id !== member.user.id),
      })),
    }));
  };

  const onDeleteInvitation = (invitation: Invitation) => {
    setInvitations(invitations.filter((i) => i.email !== invitation.email));
  };

  const onDeleteError = () =>
    setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: t('Could not delete user.', { ns: 'project-collaboration' }),
      type: 'error',
    });

  const onDeleteInviteError = () =>
    setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: t('Could not delete invitation.', { ns: 'project-collaboration' }),
      type: 'error',
    });

  const onInvitationSent = (invitation: Invitation) => {
    setToast({
      title: t('Invitation Sent', { ns: 'project-collaboration' }),
      description: t('Invitation was sent to', { ns: 'project-collaboration' }).replace(
        '${user}',
        invitation.email
      ),
      type: 'success',
    });

    setInvitations((invitations) => [...invitations, invitation]);
  };

  const onInvitationsSent = (invites: Invitation[]) => {
    setToast({
      title: t('Invitations Sent', { ns: 'project-collaboration' }),
      description: t('Invitations were sent to your list of users.', { ns: 'project-collaboration' }),
      type: 'success',
    });

    setInvitations((invitations) => [...invitations, ...invites]);
  };

  const onInvitationError = () =>
    setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: t('Could not send invitation.', { ns: 'project-collaboration' }),
      type: 'error',
    });

  const onError = (error: string) => {
    setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: t(error) || error,
      type: 'error',
    });
  };

  const handleSendInvitations = (invites: InviteListEntry[]) => {
    // Waits until the invite was processed in the backend
    const invitedBy = props.me.nickname
      ? props.me.nickname
      : props.me.first_name || props.me.last_name
      ? [props.me.first_name, props.me.last_name].join(' ')
      : undefined;

    const groupMap: { [key: string]: string } = {};
    props.project.groups.forEach((g) => {
      if (g.is_admin) {
        groupMap['admin'] = g.id;
      } else if (g.is_default) {
        groupMap['student'] = g.id;
      }
    });
    inviteUsersToProject(supabase, invites, project, groupMap, invitedBy).then(
      ({ error, data }) => {
        if (error) {
          onInvitationError();
        } else {
          onInvitationsSent(data);
        }
      }
    );
  };

  const handleAddUser = (userId: string) => {
    const requestIdx = requests.findIndex((r) => r.user_id === userId);
    if (requestIdx > -1) {
      const request = requests[requestIdx];
      acceptJoinRequest(supabase, project.id, request.id).then((resp) => {
        const name =
          requestIdx > -1 ? formatName(request.user) : t('Anonymous', { ns: 'annotation-common' });
        if (resp) {
          setToast({
            title: t('User Added', { ns: 'project-collaboration' }),
            description: `${name} ${t('was successfully added to project.', { ns: 'project-collaboration' })}`,
            type: 'success',
          });

          setRequests(requests.filter((r) => r.id !== request.id));
          // Update project groups
          const groupIn = project.groups.find((g) => g.is_default);
          if (groupIn) {
            const group = {
              ...groupIn,
              members: [...groupIn.members, { user: request.user, since: '' }],
            };
            setProject((project) => ({
              ...project,
              users: [
                ...project.users,
                {
                  inGroup: group,
                  since: '',
                  user: request.user,
                },
              ],
              groups: project.groups.map((g) =>
                g.id === group.id ? group : g
              ),
            }));
          }
        } else {
          setToast({
            title: t('Adding User Failed!', { ns: 'project-collaboration' }),
            description: `${name} ${t('was not added to project.', { ns: 'project-collaboration' })}`,
            type: 'error',
          });
        }
      });
    }
  };

  const handleIgnoreUser = (userId: string) => {
    const requestIdx = requests.findIndex((r) => r.user_id === userId);
    if (requestIdx > -1) {
      const request = requests[requestIdx];

      ignoreJoinRequest(supabase, request.id).then((res) => {
        if (res) {
          setRequests(
            requests.map((r) => {
              if (r.id === request.id) {
                return { ...request, ignored: true };
              } else {
                return r;
              }
            })
          );

          setToast({
            title: t('Request Ignored', { ns: 'project-collaboration' }),
            description: `${formatName(request.user)} ${
              t('request to join the project has been ignored.', { ns: 'project-collaboration' })
            }`,
            type: 'success',
          });
        }
      });
    }
  };

  const host =
    window.location.port !== ''
      ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
      : `${window.location.protocol}//${window.location.hostname}`;

  const link = `${host}/${i18n.language}/projects/${project.id}/request?project-name=${project.name}`;

  const handleCopyLink = () => {
    setToast({
      title: t('Copied to clipboard', { ns: 'project-collaboration' }),
      description: t('You can now distribute this link to invite users.', { ns: 'project-collaboration' }),
      type: 'info',
    });
    navigator.clipboard.writeText(encodeURI(link));
  };

  return (
    <>
      <TopBar onError={onError} me={props.user} />
      <BackButtonBar
        showBackToProjects={false}
        crumbs={[
          { label: t('Projects', { ns: 'common' }), href: `/${i18n.language}/projects/` },
          {
            label: props.project.name,
            href: `/${i18n.language}/projects/${props.project.id}`,
          },
          { label: t('Team', { ns: 'common' }), href: undefined },
        ]}
      />
      <div className='project-collaboration'>
        <ToastProvider>
          <div className='project-collaboration-title-bar'>
            <h1>{t('Project Team', { ns: 'project-collaboration' })}</h1>

            <DropdownButton
              label={t('Add a user', { ns: 'project-collaboration' })}
              icon={<UserPlus />}
              options={[
                {
                  node: (
                    <div
                      className='invite-user-item'
                      onClick={() => setAddUserOpen(true)}
                    >
                      <User size={20} />
                      <span>{t('Add single user', { ns: 'project-collaboration' })}</span>
                    </div>
                  ),
                },
                {
                  node: (
                    <div
                      className='invite-user-item'
                      onClick={() => setAddUsersOpen(true)}
                    >
                      <UsersFour size={20} />
                      <span>{t('Add list of users', { ns: 'project-collaboration' })}</span>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <MembersTable
            project={project}
            invitations={invitations}
            me={props.me}
            onChangeGroup={onChangeGroup}
            onDeleteMember={onDeleteMember}
            onDeleteMemberError={onDeleteError}
            onDeleteInvite={onDeleteInvitation}
            onDeleteInvitationError={onDeleteInviteError}
          />

          {!props.project.is_open_join && (
            <>
              <div className='project-collaboration-request-header'>
                <h1>{t('Join Requests', { ns: 'project-collaboration' })}</h1>
                <div className='project-collaboration-ignored-switch'>
                  <label htmlFor='show-ignored'>{t('Show Ignored', { ns: 'project-collaboration' })}</label>

                  <Switch.Root
                    className='switch-root'
                    id='show-ignored'
                    checked={showIgnored}
                    onCheckedChange={setShowIgnored}
                  >
                    <Switch.Thumb className='switch-thumb' />
                  </Switch.Root>
                </div>
              </div>
              <div className='project-collaboration-link-container'>
                <label htmlFor='join-link'>{t('Join Link', { ns: 'project-collaboration' })}</label>
                <InfoTooltip content={t('copy_link_info', { ns: 'project-collaboration' })} />
                <input
                  className='project-collaboration-link-input'
                  value={encodeURI(link)}
                  disabled
                  aria-label={
                    t('a link that can be sent to users you wish to invite to the project', { ns: 'a11y' })
                  }
                ></input>
                <Button
                  className='primary project-collaboration-link-button'
                  onClick={handleCopyLink}
                  aria-label={t('copy join link', { ns: 'a11y' })}
                >
                  {t('Copy Link', { ns: 'project-collaboration' })}
                </Button>
              </div>

              {requests.filter((r) => (showIgnored ? true : !r.ignored))
                .length > 0 ? (
                <JoinRequestsTable
                  project={project}
                  requests={requests}
                  onAcceptUser={handleAddUser}
                  showIgnored={showIgnored}
                  onIgnoreUser={handleIgnoreUser}
                />
              ) : (
                <div className='project-collaboration-no-requests'>
                  {t('No Open Join Requests', { ns: 'project-collaboration' })}
                </div>
              )}
            </>
          )}
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
          <InviteUserDialog
            me={props.me}
            project={project}
            open={addUserOpen}
            invitations={invitations}
            onInvitiationSent={onInvitationSent}
            onInvitiationError={onInvitationError}
            onClose={() => setAddUserOpen(false)}
          />
          <InviteListOfUsersDialog
            me={props.me}
            project={project}
            onError={onError}
            onSend={handleSendInvitations}
            open={addUsersOpen}
            onClose={() => setAddUsersOpen(false)}
          />
        </ToastProvider>
      </div>
    </>
  );
};

export const ProjectCollaborationWrapper = (props: ProjectCollaborationProps) => (
  <I18nextProvider i18n={clientI18next}>
    <ProjectCollaboration {...props} />
  </I18nextProvider>
);
