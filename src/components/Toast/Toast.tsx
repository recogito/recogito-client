import { useEffect, useState } from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import { X } from '@phosphor-icons/react';
import type { UIAlert } from 'src/Types';

const { Root, Title, Description, Action, Viewport } = RadixToast;

export interface ToastProps {

  alert?: UIAlert | null;

  closeAltText?: string;

  duration?: number;

  onOpenChange(open: boolean): void;

}

export const Toast = (props: ToastProps) => {

  const icon = props.alert?.icon;

  // Note that we need to keep the alert on screen,
  // even after the prop has gone null, for the exit anim.
  const [alert, setAlert] = useState(props.alert);

  useEffect(() => {
    if (props.alert)
      setAlert(props.alert);
  }, [props.alert]);

  return (
    <>
      <Root 
        className="toast" 
        duration={props.duration || 5000}
        open={Boolean(props.alert)}
        onOpenChange={props.onOpenChange}>

        <Title className="toast-title">
          {icon} {alert?.title}
        </Title>

        <Description className="toast-description">
          {alert?.description}
        </Description>

        <Action className="toast-action" asChild altText={props.closeAltText || 'Close alert'}>
          <button className="unstyled icon-only">
            <X size={20} weight="light" />
          </button>
        </Action>
      </Root>

      <Viewport className="toast-viewport" />
    </>
  )

}

export const ToastProvider = RadixToast.Provider;