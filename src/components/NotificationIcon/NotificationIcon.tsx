import './NotificationIcon.css';
import * as RadixAvatar from '@radix-ui/react-avatar';

const { Root, Image, Fallback } = RadixAvatar;

export interface NotificationIconProps {
    count: number;
}

const NotificationIcon = (props: NotificationIconProps) => {

    return (
        <Root className='notification'>
            <Fallback
                className='notification-count'
                style={{ backgroundColor: 'red' }}
                >
                    {props.count}
                </Fallback>
        </Root>
    )

}

export default NotificationIcon;