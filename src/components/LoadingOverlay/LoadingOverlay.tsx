import { Spinner } from '@components/Spinner';

import './LoadingOverlay.css';

/**
 * A full-screen loading indicator that makes the content underneath inert.
 */
export const LoadingOverlay = () => {

  return (
    <div className="loading-overlay">
      <Spinner />
    </div>
  )

}