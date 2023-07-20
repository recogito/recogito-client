import { getProjectGroups, listProjectUsers, updateUserProjectGroup } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import { useEffect, useState } from "react";
import type { Project, Translations, UserProfile } from "src/Types";
import './ManageUsers.css';
import { ProjectUserRow } from "@components/ProjectUserRow";
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, X } from '@phosphor-icons/react';
import * as InviteDialog from '@radix-ui/react-dialog';
import InviteUsersToProject from "./InviteUsersToProject";

const { Root, Indicator } = Checkbox;

interface ManageUsersProps {

    i18n: Translations,

    project: Project,

    user: UserProfile | undefined

};

export const ManageUsers = (props: ManageUsersProps) => {
    const { t } = props.i18n;
    const { project } = props;

    const [data, setData] = useState<any[]>();
    const [projectGroups, setProjectGroups] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);

    const handleRemoveUser = (id: string) => {
        console.log('user ' + id + ' has been removed');
    };

    const handleToggleSelected = (id: string) => {
        if (selected.includes(id)) {
            setSelected((old) => old.filter((i) => i != id));
        }
        else setSelected((old) => [...old, id]);
    };

    const toggleSelectAll = () => {
        if (data && data.length == selected.length) {
            setSelected([]);
        }
        else setSelected(data ? data.map((i) => i.profiles.id) : []);
    };

    const handleUpdateUser = (userId: string, oldTypeId: string, newTypeId: string) => {
        updateUserProjectGroup(supabase, userId, oldTypeId, newTypeId).then(({ error, data }) => {
            if (data) {
                setData((old) => old?.map((row) => (row.type_id == oldTypeId && row.profiles.id == userId) ? { type_id: newTypeId, profiles: row.profiles } : row));
            }
            else {
                console.log(error);
            }
        });
    };

    useEffect(() => {
        getProjectGroups(supabase, project.id).then(({ error, data }) => {
            if (data) {
                setProjectGroups(data);
                listProjectUsers(supabase, data.map((i) => i.id)).then((data) => {console.log(data); setData(data ? data : [])});
            }
            else {
                setData([]);
            }
        })
    }, [])

    return data && data.length && (
        <div className="manage-users">
            <h1>Project Users</h1>
            <InviteDialog.Root>
                <InviteDialog.Trigger asChild>
                    <button className="primary">{t["Invite"]}</button>
                </InviteDialog.Trigger>
                <InviteDialog.Portal>
                    <InviteDialog.Overlay className="InviteDialogOverlay"/>
                    <InviteDialog.Content className="InviteDialogContent">
                        <InviteDialog.Title>
                            Invite User to Project
                        </InviteDialog.Title>
                        <InviteDialog.Description>
                            Enter the email and role below.
                        </InviteDialog.Description>
                            <InviteUsersToProject
                                i18n={props.i18n}
                                project={props.project}
                                user={props.user}
                                />
                        <InviteDialog.Close asChild>
                            <button className="InviteDialogClose" aria-label="Close">
                                <X />
                            </button>
                        </InviteDialog.Close>
                    </InviteDialog.Content>
                </InviteDialog.Portal>
            </InviteDialog.Root>
            <div className="users-table">
                <div className="header row">
                    <div style={{ width: '10%' }}>
                        <Root onCheckedChange={toggleSelectAll} className="CheckboxRoot" checked={data.length == selected.length}>
                            <Indicator>
                                <Check size={15} style={{ display: 'flex' }} />
                            </Indicator>
                        </Root>
                    </div>
                    <div style={{ width: '30%' }}>Name</div>
                    <div style={{ width: '30%' }}>Role</div>
                    <div style={{ width: '30%' }}>Actions</div>
                </div>
            { data?.map((user) => (
                <ProjectUserRow
                    key={user.profiles.id}
                    i18n={props.i18n}
                    user={user}
                    typeId={user.type_id}
                    onRemoveUser={() => handleRemoveUser(user.profiles.id)}
                    onUpdateUser={(typeId: string) => handleUpdateUser(user.profiles.id, user.type_id, typeId)}
                    onSelectRow={() => handleToggleSelected(user.profiles.id)}
                    selected={selected.includes(user.profiles.id)}
                    roleName={projectGroups.find((i) => i.id == user.type_id).name}
                />
            ))}
            </div>
        </div>
    );
}