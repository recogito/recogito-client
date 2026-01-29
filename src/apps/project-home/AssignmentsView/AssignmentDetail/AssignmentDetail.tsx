import { Avatar } from '@components/Avatar';
import { DocumentCard } from '@components/DocumentCard';
import { AssignmentsActions } from './AssignmentActions';
import type {
  Context,
  UserProfile,
  Document,
  Group,
} from 'src/Types';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateContextDocumentsSort } from '@backend/helpers';
import { useTranslation } from 'react-i18next';

import './AssignmentDetail.css';

interface AssignmentDetailProps {
  assignment: Context;

  isAdmin: boolean;

  groups: Group[];

  onEditAssignment(assignment: Context): void;

  onDeleteAssignment(assignment: Context): void;
}

export const AssignmentDetail = (props: AssignmentDetailProps) => {
  const { t, i18n } = useTranslation(['project-assignments', 'common']);

  const [documents, setDocuments] = useState<Document[]>([]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  useEffect(() => {
    if (props.assignment) {
      setDocuments(
        props.assignment.context_documents
          .map((d) => ({
            ...d.document,
            sort: d.sort,
          }))
          .sort((a, b) => a.sort - b.sort)
      );
    }
  }, [props.assignment]);

  const onDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = documents.findIndex(
          (document) => document.id === active.id
        );
        const newIndex = documents.findIndex(
          (document) => document.id === over!.id
        );

        const newDocuments = arrayMove(documents, oldIndex, newIndex);
        setDocuments(newDocuments);

        const newDocumentIds = newDocuments.map((document) => document.id);

        updateContextDocumentsSort(
          supabase,
          props.assignment.id,
          newDocumentIds
        ).then(({ error }) => {
          if (error) {
            console.log(error);
          }
        });
      }
    },
    [documents, props.assignment]
  );

  const members = props.assignment.members.reduce(
    (members, context_user) => [...members, context_user.user as UserProfile],
    [] as UserProfile[]
  );

  const handleDelete = () => {
    props.onDeleteAssignment(props.assignment);
  };

  const admins = props.groups
    .filter((g) => g.is_admin)
    .reduce(
      (admins, group) => [...admins, ...group.members.map((m) => m.user)],
      [] as UserProfile[]
    );

  return (
    <div className='assignment-detail-container'>
      <div className='assignment-detail-pane'>
        <div className='assignment-detail-title-row'>
          <div className='assignment-detail-title'>
            {props.assignment.is_project_default
              ? t('Project Baselayer', { ns: 'project-assignments' })
              : props.assignment.name}
          </div>

          <div className='assignment-detail-buttons'>
            {props.isAdmin && !props.assignment.is_project_default && (
              <AssignmentsActions
                context={props.assignment}
                isAdmin={props.isAdmin}
                onEdit={() => props.onEditAssignment(props.assignment)}
                onDelete={handleDelete}
                onExportCSV={() => {
                  window.location.href = `/${i18n.language}/projects/${props.assignment.project_id}/export/csv?context=${props.assignment.id}`;
                }}
              />
            )}
          </div>
        </div>

        <div className='assignment-detail-description-row'>
          <div className='assignment-detail-description'>
            {props.assignment.is_project_default &&
            (!props.assignment.description ||
              props.assignment.description.length === 0)
              ? t('base_assignment_description', { ns: 'project-assignments' })
              : props.assignment.description}
          </div>
          <div className='assignment-detail-team'>
            {t('Team', { ns: 'common' })}
            <div className='assignment-detail-team-list'>
              {[...admins, ...members].map((user: UserProfile) => (
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <div className='project-home-grid'>
              <SortableContext items={documents} strategy={rectSortingStrategy}>
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    isAdmin={props.isAdmin}
                    document={document as Document}
                    context={props.assignment}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
