import type { Translations, UserProfile } from "src/Types";
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from '@phosphor-icons/react';
import './ProjectUserRow.css';

const { Root, Indicator } = Checkbox;

interface ProjectUserRowProps {
    i18n: Translations
    user: any
    typeId?: string
    email?: string
    roleName: string
    onRemoveUser?: () => void
    onUpdateUser?: (typeId: string) => void
    onSelectRow?: () => void
    onOpenEditModal?: () => void
    selected?: boolean
    pending?: boolean
}

export const ProjectUserRow = (props: ProjectUserRowProps) => {
    const { t } = props.i18n;
    const { user, typeId, onRemoveUser, onUpdateUser, roleName, onSelectRow, selected, onOpenEditModal, pending } = props;

    return (
        <div className="row">
                <div style={{ width: '5%' }}>
                    { !pending && (<Root onCheckedChange={onSelectRow} className="CheckboxRoot" checked={selected}>
                        <Indicator>
                            <Check size={15} style={{ display: 'flex' }} />
                        </Indicator>
                    </Root>) }
                </div>
                <div style={{ width: '20%' }}>
                    {(user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') +user.profiles.last_name : user.profiles.nickname}
                </div>
                <div style={{ width: '30%' }}>
                    {user.profiles.email}
                </div>
                <div style={{ width: '18%' }}>
                    {roleName}
                </div>
                <div style={{ width: '27%', display: 'flex' }}>
                    <button style={{ display: 'flex', padding: '5px 8px' }} className="primary" onClick={onOpenEditModal}>Edit Role</button>
                    <button style={{ display: 'flex', padding: '5px 8px' }} onClick={onRemoveUser}>Remove User</button>
                </div>
            </div>
    )


}