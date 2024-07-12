import { useState } from 'react';
import { Toast, ToastProvider } from '@components/Toast';
import type { ToastContent } from '@components/Toast';
import { InviteUser } from './InviteUser';
import { MembersTable } from './MembersTable';
import { JoinRequestsTable } from './JoinRequestsTable';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Group,
  Translations,
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

import './ProjectCollaboration.css';
import { InviteListOfUsers } from './InviteListOfUsers/InviteListOfUsers';

interface ProjectCollaborationProps {
  i18n: Translations;

  project: ExtendedProjectData;

  projects: ExtendedProjectData[];

  invitations: Invitation[];

  requests: JoinRequest[];

  me: MyProfile;

  user: MyProfile;
}

export const ProjectCollaboration = (props: ProjectCollaborationProps) => {
  const { t } = props.i18n;

  const [project, setProject] = useState(props.project);

  const [invitations, setInvitations] = useState(props.invitations);

  const [requests, setRequests] = useState(props.requests);

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [showIgnored, setShowIgnored] = useState(false);

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
      title: t['Something went wrong'],
      description: t['Could not delete user.'],
      type: 'error',
    });

  const onDeleteInviteError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not delete invitation.'],
      type: 'error',
    });

  const onInvitationSent = (invitation: Invitation) => {
    setToast({
      title: t['Invitation Sent'],
      description: t['Invitation was sent to'].replace(
        '${user}',
        invitation.email
      ),
      type: 'success',
    });

    setInvitations((invitations) => [...invitations, invitation]);
  };

  const onInvitationError = () =>
    setToast({
      title: t['Something went wrong'],
      description: t['Could not send invitation.'],
      type: 'error',
    });

  const onError = (error: string) => {
    setToast({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  const handleAddUser = (userId: string) => {
    const requestIdx = requests.findIndex((r) => r.user_id === userId);
    if (requestIdx > -1) {
      const request = requests[requestIdx];
      acceptJoinRequest(supabase, project.id, request.id).then((resp) => {
        const name =
          requestIdx > -1 ? formatName(request.user) : t['Anonymous'];
        if (resp) {
          setToast({
            title: t['User Added'],
            description: `${name} ${t['was successfully added to project.']}`,
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
            title: t['Adding User Failed!'],
            description: `${name} ${t['was not added to project.']}`,
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
            title: t['Request Ignored'],
            description: `${formatName(request.user)} ${
              t['request to join the project has been ignored.']
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

  const link = `${host}/${props.i18n.lang}/projects/${project.id}/request?project-name=${project.name}`;

  const handleCopyLink = () => {
    setToast({
      title: t['Copied to clipboard'],
      description: t['You can now distribute this link to invite users.'],
      type: 'info',
    });
    navigator.clipboard.writeText(encodeURI(link));
  };

  return (
    <>
      <TopBar
        invitations={props.invitations}
        i18n={props.i18n}
        onError={onError}
        me={props.user}
      />
      <BackButtonBar
        i18n={props.i18n}
        showBackToProjects={false}
        crumbs={[
          { label: t['Projects'], href: `/${props.i18n.lang}/projects/` },
          {
            label: props.project.name,
            href: `/${props.i18n.lang}/projects/${props.project.id}`,
          },
          { label: t['Team'], href: undefined },
        ]}
      />
      <div className='project-collaboration'>
        <ToastProvider>
          <h1>{t['Project Team']}</h1>

          <InviteUser
            i18n={props.i18n}
            me={props.me}
            project={project}
            invitations={invitations}
            onInvitiationSent={onInvitationSent}
            onInvitiationError={onInvitationError}
          />
          <InviteListOfUsers
            i18n={props.i18n}
            me={props.me}
            project={project}
            invitations={invitations}
            onInvitiationSent={onInvitationSent}
            onInvitiationError={onInvitationError}
          />

          <MembersTable
            i18n={props.i18n}
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
                <h1>{t['Join Requests']}</h1>
                <div className='project-collaboration-ignored-switch'>
                  <label htmlFor='show-ignored'>{t['Show Ignored']}</label>

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
                <label htmlFor='join-link'>{t['Join Link']}</label>
                <InfoTooltip content={t['copy_link_info']} />
                <input
                  className='project-collaboration-link-input'
                  value={encodeURI(link)}
                  disabled
                ></input>
                <Button
                  className='primary project-collaboration-link-button'
                  onClick={handleCopyLink}
                >
                  {t['Copy Link']}
                </Button>
              </div>

              {requests.filter((r) => (showIgnored ? true : !r.ignored))
                .length > 0 ? (
                <JoinRequestsTable
                  i18n={props.i18n}
                  project={project}
                  requests={requests}
                  onAcceptUser={handleAddUser}
                  showIgnored={showIgnored}
                  onIgnoreUser={handleIgnoreUser}
                />
              ) : (
                <div className='project-collaboration-no-requests'>
                  {t['No Open Join Requests']}
                </div>
              )}
            </>
          )}
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
        </ToastProvider>
      </div>
    </>
  );
};
