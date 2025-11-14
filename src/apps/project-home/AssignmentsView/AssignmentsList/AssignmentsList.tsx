import type { Context } from 'src/Types';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateContextSort } from '@backend/helpers';

interface AssignmentsListProps {
  assignments: Context[];

  currentAssignment: string;

  projectId: string;

  isAdmin: boolean;

  onAssignmentSelect(assignment: Context): void;

  setAssignments(assignments: Context[]): void;
}

import './AssignmentsList.css';
import { AssignmentListItem } from './AssignmentListItem';

export const AssignmentsList = (props: AssignmentsListProps) => {
  const [activeId, setActiveId] = useState(null);

  const [activeAssignment, setActiveAssignment] = useState<
    Context | undefined
  >();

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const onDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = props.assignments.findIndex(
          (assignment) => assignment.id === active.id
        );
        const newIndex = props.assignments.findIndex(
          (assignment) => assignment.id === over!.id
        );

        const newAssignments = arrayMove(props.assignments, oldIndex, newIndex);
        props.setAssignments(newAssignments);

        const newContextIds = newAssignments.map((assignment) => assignment.id);

        updateContextSort(supabase, props.projectId, newContextIds).then(
          ({ error }) => {
            if (error) {
              console.log(error);
            }
          }
        );
      }

      setActiveId(null);
    },
    [props.assignments, props.projectId]
  );

  const onDragCancel = useCallback(() => setActiveAssignment(undefined), []);

  const onDragStart = useCallback(
    (event: any) =>
      setActiveAssignment(
        props.assignments.find((a) => a.id === event.active.id)
      ),
    []
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className='assignment-list-list'>
        <SortableContext
          items={props.assignments}
          strategy={rectSortingStrategy}
        >
          {props.assignments.map((assignment) => (
            <AssignmentListItem
              assignment={assignment}
              active={assignment.id === props.currentAssignment}
              onClick={() => props.onAssignmentSelect(assignment)}
              isAdmin={props.isAdmin}
              key={assignment.id}
            />
          ))}
        </SortableContext>
        <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
          {activeAssignment && (
            <AssignmentListItem
              assignment={activeAssignment}
              active={activeAssignment.id === activeId}
              onClick={() => props.onAssignmentSelect(activeAssignment)}
              isAdmin={props.isAdmin}
            />
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
};
