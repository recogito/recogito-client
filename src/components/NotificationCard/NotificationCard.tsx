import './NotificationCard.css';

export interface NotificationCardProps {
    invitedBy: string,
    projectName: string,
    inviteId: string,
    onAccept(): void,
    onIgnore(): void
};

const NotificationCard = (props: NotificationCardProps) => {
    return (
        <div className="notification-card">
            <div>
                <h1>{props.projectName}</h1>
                <p>You have been invited to join this project by {props.invitedBy}</p>
                <div className="notification-actions">
                    <button className="primary" onClick={props.onAccept}>Accept</button>
                    <button className="primary" onClick={props.onIgnore}>Ignore</button>
                </div>
            </div>
        </div>
    )
};

export default NotificationCard