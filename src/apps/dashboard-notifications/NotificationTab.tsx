import { getContext } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import NotificationCard from "@components/NotificationCard/NotificationCard";
import { useEffect, useState } from "react";
import type { Invitation, MyProfile, Translations } from "src/Types";
import './NotificationTab.css';
import { processAcceptInvite, processIgnoreInvite } from "@backend/crud/notifications";


export interface NotificationTabProps {
    i18n: Translations,
    invitationList?: Invitation[] 
}

const NotificationTab = (props: NotificationTabProps) => {
    const { t } = props.i18n;
    const [ invites, setInvites ] = useState<any[]>([]);

    const removeInviteFromList = (id: string) => {
        const updatedList = invites?.filter((i) => i.id == id);
        setInvites(updatedList);
    };

    useEffect(() => {
        const cardData = (props.invitationList && props.invitationList.length > 0) ? props.invitationList.map((i) => ({
            ...i,
            onAccept: () => processAcceptInvite(supabase, i.id).then(() => removeInviteFromList(i.id)),
            onIgnore: () => processIgnoreInvite(supabase, i.id).then(() => removeInviteFromList(i.id))
        })) : [];
        setInvites(cardData);
    }, []);

    
    return (
        <div className="dashboard-notifications">
            <h1>Pending Invitations</h1>
            <div className="notification-grid">
                {invites.length > 0 ? invites.map((i) => (
                    <NotificationCard
                        key={i.id}
                        inviteId={i.id}
                        invitedBy={i.invited_by_name ? i.invited_by_name : 'a secret admirer'}
                        projectName={i.project_name ? i.project_name : 'a secret project'}
                        onAccept={i.onAccept}
                        onIgnore={i.onIgnore}
                        />
                )) : (
                    <p>You have no invitations pending at the moment!</p>
                )}
            </div>
        </div>
    )
}

export default NotificationTab;