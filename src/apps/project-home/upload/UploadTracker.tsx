import * as RadixToast from '@radix-ui/react-toast';
import { CheckCircle, X, XCircle } from '@phosphor-icons/react';
import { ProgressCircle } from '@components/ProgressCircle';
import type { UploadProgress } from './Upload';

import './UploadTracker.css';

const { Root, Title, Description, Viewport } = RadixToast;

interface UploadTrackerProps {

  show: boolean;

  closable: boolean;

  uploads: UploadProgress[];

  onClose(): void;

}

export const UploadTracker = (props: UploadTrackerProps) => {

  return (
    <>
      <Root 
        className="toast upload-tracker" 
        duration={100 * 365 * 24 * 60 * 60}
        open={props.show}>

        <Title className="toast-title">
          Importing {props.uploads.length} items
          {props.closable && (
            <button className="unstyled icon-only" onClick={props.onClose}>
              <X size={20} />
            </button>
          )}
        </Title>

        <Description className="toast-description">
          <ul>
            <li>
              <span className="upload-name">test-1.jpg</span>
              <ProgressCircle className="upload-progress" progress={60} />
            </li>
            {props.uploads.map(u => (
              <li key={u.id}>
                <span className="upload-name">{u.name}</span>
                {u.status === 'preparing' || u.status === 'uploading' ? (
                  <ProgressCircle className="upload-progress" progress={u.progress} />
                ) : u.status === 'success' ? (
                  <CheckCircle className="upload-success" size={24} weight="fill" />
                ) : (
                  <XCircle className="upload-failed" size={24} weight="fill" />
                )}
              </li>
            ))}
          </ul>
        </Description>
      </Root>

      <Viewport className="toast-viewport" />
    </>
  )

}