import { Avatar } from '@components/Avatar';
import { DocumentCard } from '@components/DocumentCard';
import { AssignmentsActions } from './AssignmentActions';
import type {
  Context,
  Translations,
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

import './AssignmentDetail.css';

interface AssignmentDetailProps {
  assignment: Context;

  isAdmin: boolean;

  i18n: Translations;

  groups: Group[];

  onEditAssignment(assignment: Context): void;

  onDeleteAssignment(assignment: Context): void;
}

export const AssignmentDetail = (props: AssignmentDetailProps) => {
  const { lang, t } = props.i18n;
  const { context_documents } = props.assignment;

  const [activeId, setActiveId] = useState(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const onDragStart = useCallback(
    (event: any) => setActiveId(event.active.id),
    []
  );

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

      setActiveId(null);
    },
    [documents, props.assignment]
  );

  const onDragCancel = useCallback(() => setActiveId(null), []);

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
              ? t['Project Baselayer']
              : props.assignment.name}
          </div>

          <div className='assignment-detail-buttons'>
            {props.isAdmin && !props.assignment.is_project_default && (
              <AssignmentsActions
                i18n={props.i18n}
                context={props.assignment}
                isAdmin={props.isAdmin}
                onEdit={() => props.onEditAssignment(props.assignment)}
                onDelete={handleDelete}
                onExportCSV={() => {
                  window.location.href = `/${lang}/projects/${props.assignment.project_id}/export/csv?context=${props.assignment.id}`;
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
              ? t['base_assignment_description']
              : props.assignment.description}
          </div>
          <div className='assignment-detail-team'>
            {t['Team']}
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
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
          >
            <div className='project-home-grid'>
              <SortableContext items={documents} strategy={rectSortingStrategy}>
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    isAdmin={props.isAdmin}
                    i18n={props.i18n}
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
