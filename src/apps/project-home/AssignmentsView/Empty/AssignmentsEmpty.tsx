import { GraduationCap } from '@phosphor-icons/react';

export const AssignmentsEmpty = () => {

  return (
    <div className="project-assignments-empty">
      <div className="container">
        <p className="assignments-explained">
          <strong>Assignments</strong> are an advanced feature for sharing
          parts of a project with a group of users. Annotations from each
          group appear as different layers, so you can filter and compare
          between them.
        </p>

        <div className="project-assignments-empty-actions">
          <a className="button" href="">Learn more</a>

          <button>
            <GraduationCap /> <span>Create an assignment</span>
          </button>
        </div>
      </div>
    </div>
  )

}