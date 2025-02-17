import type { Context, Translations } from 'src/Types';
import { DotsSix } from '@phosphor-icons/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';
import './AssignmentsList.css';

interface AssignmentListItemProps {
  assignment: Context;

  active: boolean;

  i18n: Translations;

  isAdmin: boolean;

  onClick?(): void;
}
export const AssignmentListItem = (props: AssignmentListItemProps) => {
  const { assignment, active } = props;

  const { t } = props.i18n;

  const sortableProps = useMemo(
    () => ({
      id: assignment.id,
      disabled: !props.isAdmin,
    }),
    [assignment, props.isAdmin]
  );

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable(sortableProps);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition]
  );

  return (
    <div
      className={
        active ? 'assignments-list-item selected' : 'assignments-list-item'
      }
      key={assignment.id}
      onClick={props.onClick ? props.onClick : () => {}}
      ref={setNodeRef}
      style={style}
    >
      <div className='assignments-list-item-meta'>
        <div className='assignments-list-item-date'>
          {new Date(assignment.created_at).toLocaleDateString()}
        </div>
        <div className='assignments-list-item-title'>
          {assignment.is_project_default
            ? t['Project Baselayer']
            : assignment.name}
        </div>
      </div>
      {props.isAdmin && !assignment.is_project_default && (
        <div className='document-drag-handle' {...attributes} {...listeners}>
          <DotsSix size={24} />
        </div>
      )}
    </div>
  );
};
