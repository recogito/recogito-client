import './Notification.css';

export interface NotificationIconProps {
    count: number;
}

const NotificationIcon = (props: NotificationIconProps) => {

    return (
        <span className='notification-icon'>
            {props.count}
        </span>
    )

}

export default NotificationIcon;