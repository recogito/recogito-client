import { getContext } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import NotificationCard from "@components/NotificationCard/NotificationCard";
import { useEffect, useState } from "react";
import type { MyProfile, Translations } from "src/Types";
import './NotificationTab.css';


interface NotificationTabProps {
    i18n: Translations,
    notificationList?: any[] //type this better later
}

const NotificationTab = (props: NotificationTabProps) => {
    const { t } = props.i18n;
    const [ invites, setInvites ] = useState([]);

    const dummyData = [
        {
            invitedBy: 'Rebecca',
            projectName: 'A cool project',
            inviteID: '6443ba2d-5b2e-4dae-8fa0-67aee212ae7c',
            onAccept: () => (console.log('accept 6443ba2d-5b2e-4dae-8fa0-67aee212ae7c')),
            onIgnore: () => (console.log('ignore 6443ba2d-5b2e-4dae-8fa0-67aee212ae7c'))
        },
        {
            invitedBy: 'Some random person',
            projectName: 'A boring project',
            inviteID: 'sdfsdfsdwer0',
            onAccept: () => (console.log('accept sdfsdfsdwer0')),
            onIgnore: () => (console.log('ignore sdfsdfsdwer0'))
        }
    ]

    return (
        <div className="dashboard-notifications">
            <h1>Pending Invitations</h1>
            <div className="notification-grid">
                {dummyData.map((i) => (
                    <NotificationCard
                        key={i.inviteID}
                        inviteId={i.inviteID}
                        invitedBy={i.invitedBy}
                        projectName={i.projectName}
                        onAccept={i.onAccept}
                        onIgnore={i.onIgnore}
                        />
                ))}
            </div>
        </div>
    )
}

export default NotificationTab;