import './NotificationIcon.css';

export interface NotificationIconProps {
    count: number;
}

const NotificationIcon = (props: NotificationIconProps) => {

    return (
        <div className='notification'>
            <div
                className='notification-count'
                style={{ backgroundColor: 'red' }}
                >
                    {props.count}
                </div>
        </div>
    )

}

export default NotificationIcon;