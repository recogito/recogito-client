import * as RadixToast from '@radix-ui/react-toast';
import * as Progress from '@radix-ui/react-progress';
import { UploadSimple } from '@phosphor-icons/react';

import './UploadProgress.css';

const { Root, Title, Description, Viewport } = RadixToast;

interface UploadProgressProps {

  open: boolean;

  filename: string;

  progress: number;

}

export const UploadProgress = (props: UploadProgressProps) => {

  const { filename, open, progress } = props;

  return (
    <>
      <Root 
        className="toast upload-progress" 
        duration={100 * 365 * 24 * 60 * 60}
        open={open}>

        <Title className="toast-title">
          <UploadSimple size={18} weight="bold" className="text-bottom" /> {filename}
        </Title>

        <Description className="toast-description">
          <Progress.Root className="progress-root" value={progress}>
            <Progress.Indicator
              className="progress-indicator"
              style={{ transform: `translateX(-${100 - progress}%)` }}
            />
          </Progress.Root>
        </Description>
      </Root>

      <Viewport className="toast-viewport" />
    </>
  )

}