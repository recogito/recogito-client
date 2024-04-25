import './AuthorDetails.css';

interface AuthorDetailsProps {

  isPrivate?: boolean;

}

export const AuthorDetails = (props: AuthorDetailsProps) => {

  return (
    <div className="author-details">
      <div className="created-by">
        {props.isPrivate ? 'Private' : 'Lorin'}
      </div>

      <div className="created-at">
        9:36 AM Jan 04
      </div>
    </div>
  )

}