import { supabase } from "@backend/supabaseBrowserClient";
import type { MyProfile, Translations } from "src/Types";


interface NotificationTabProps {
    i18n: Translations,
    profile: MyProfile
}

const NotificationTab = (props: NotificationTabProps) => {
    const { t } = props.i18n;
    const { email } = props.profile;

    return (
        <div>
            hi
        </div>
    )
}

export default NotificationTab;