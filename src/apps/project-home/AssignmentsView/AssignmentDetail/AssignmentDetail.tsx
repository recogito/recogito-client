import type { Context, Translations, UserProfile, Document } from 'src/Types';
import { Pencil, Trash } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import { DocumentCard } from '@components/DocumentCard';
import { ConfirmDelete } from './ConfirmDelete';

import './AssignmentDetail.css';
import { useState } from 'react';

interface AssignmentDetailProps {
  assignment: Context;

  isAdmin: boolean;

  i18n: Translations;

  onEditAssignment(assignment: Context): void;

  onDeleteAssignment(assignment: Context): void;
}

export const AssignmentDetail = (props: AssignmentDetailProps) => {
  const { t } = props.i18n;

  const [confirmOpen, setConfirmOpen] = useState(false);

  const members = props.assignment.members.reduce(
    (members, context_user) => [...members, context_user.user as UserProfile],
    [] as UserProfile[]
  );

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  return (
    <div className='assignment-detail-container'>
      <div className='assignment-detail-divider' />
      <div className='assignment-detail-pane'>
        <div className='assignment-detail-title-row'>
          <div className='assignment-detail-title'>
            {props.assignment.is_project_default
              ? t['Project Base Assignment']
              : props.assignment.name}
          </div>
          {props.isAdmin && (
            <div className='assignment-detail-buttons'>
              <button
                className='project-header-button'
                onClick={() => props.onEditAssignment(props.assignment)}
              >
                <Pencil color='black' size={20} />
                <div className='project-header-button-text'>{t['Edit']}</div>
              </button>
              <button className='project-header-button' onClick={handleDelete}>
                <Trash color='black' size={20} />
                <div className='project-header-button-text'>{t['Delete']}</div>
              </button>
            </div>
          )}
        </div>
        <div className='assignment-detail-description-row'>
          <div className='assignment-detail-description'>
            {props.assignment.is_project_default &&
            (!props.assignment.description ||
              props.assignment.description.length === 0)
              ? t['base_assignment_description']
              : props.assignment.description}
          </div>
          <div className='assignment-detail-team'>
            {t['Team']}
            <div className='assignment-detail-team-list'>
              {members.map((user: UserProfile) => (
                <div className='assignment-detail-team-avatar' key={user.id}>
                  <Avatar
                    id={user.id}
                    name={
                      user.nickname
                        ? user.nickname
                        : [user.first_name, user.last_name]
                            .filter((str) => str)
                            .join(' ')
                            .trim()
                    }
                    avatar={user.avatar_url}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className='assignment-detail-document-grid'>
          <div className='project-home-grid'>
            {props.assignment.context_documents.map(({ document }) => (
              <DocumentCard
                key={document.id}
                isDefaultContext
                isAdmin={false}
                i18n={props.i18n}
                document={document as Document}
                context={props.assignment}
              />
            ))}
          </div>
        </div>
      </div>
      <ConfirmDelete
        i18n={props.i18n}
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          props.onDeleteAssignment(props.assignment);
        }}
      />
    </div>
  );
};
