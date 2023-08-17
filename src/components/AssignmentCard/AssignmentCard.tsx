import type { Context } from "src/Types"

interface AssignmentCardProps {

  // Just temporary, for hacking/testing
  assignment: Context;

}

export const AssignmentCard = (props: AssignmentCardProps) => {

  const { assignment } = props;

  return (
    <div className="assignment-card">
      {assignment.name}
    </div>
  )

}