import { getProjectGroups, listProjectUsers, removeUserFromProject, updateUserProjectGroup } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import { useEffect, useState } from "react";
import type { Project, Translations, UserProfile } from "src/Types";
import './ManageUsers.css';
import { ProjectUserRow } from "@components/ProjectUserRow";
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check, X } from '@phosphor-icons/react';
import * as InviteDialog from '@radix-ui/react-dialog';
import InviteUsersToProject from "./InviteUsersToProject";
import EditUserModal from "./EditUserModal";
import RemoveUserModal from "./RemoveUserModal";

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
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [currentlyEditing, setCurrentlyEditing] = useState<{id: string, name: string, type_id: string} | null>(null);
    const [currentlyRemoving, setCurrentlyRemoving] = useState<{id: string, name: string, typeId: string} | null>(null);
    const [removeModalOpen, setRemoveModalOpen] = useState(false);

    const handleRemoveUser = (id: string, typeId: string) => {
        removeUserFromProject(supabase, id, typeId).then((response) => {
            if (!response) {
                setData((old) => old?.filter((i) => i.profiles.id != id));
                setCurrentlyRemoving(null);
                setRemoveModalOpen(false);
            }
            else console.log(response);
        });
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

    const handleOpenEditModal = (id: string, name: string, type_id: string) => {
        setCurrentlyEditing({ id: id, name: name, type_id: type_id });
        setEditModalOpen(true);
    };

    const handleOpenRemoveModal = (id: string, name: string, typeId: string) => {
        setCurrentlyRemoving({ id: id, name: name, typeId: typeId });
        setRemoveModalOpen(true);
        setEditModalOpen(false);
    };

    const handleCloseRemoveModal = () => {
        setRemoveModalOpen(false);
        setCurrentlyRemoving(null);
        if (currentlyEditing) {
            setEditModalOpen(true);
        }
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

    const handleOpenEditModal = (id: string, name: string, type_id: string) => {
        setCurrentlyEditing({ id: id, name: name, type_id: type_id });
        setEditModalOpen(true);
    };

    const handleOpenRemoveModal = (id: string, name: string, typeId: string) => {
        setCurrentlyRemoving({ id: id, name: name, typeId: typeId });
        setRemoveModalOpen(true);
        setEditModalOpen(false);
    };

    const handleCloseRemoveModal = () => {
        setRemoveModalOpen(false);
        setCurrentlyRemoving(null);
        if (currentlyEditing) {
            setEditModalOpen(true);
        }
    };

    const handleUpdateUser = (userId: string, oldTypeId: string, newTypeId: string) => {
        updateUserProjectGroup(supabase, userId, oldTypeId, newTypeId).then((response) => {
            if (!response) {
                setData((old) => old?.map((row) => (row.type_id == oldTypeId && row.profiles.id == userId) ? { type_id: newTypeId, profiles: row.profiles } : row));
                setCurrentlyEditing(null);
                setEditModalOpen(false);
            }
            else {
                console.log(response);
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
                    <InviteDialog.Overlay className="CollabDialogOverlay"/>
                    <InviteDialog.Content className="CollabDialogContent">
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
                            <button className="CollabDialogClose" aria-label="Close">
                                <X />
                            </button>
                        </InviteDialog.Close>
                    </InviteDialog.Content>
                </InviteDialog.Portal>
            </InviteDialog.Root>
            <div className="users-table">
                <div className="header row">
                    <div style={{ width: '3%' }}>
                        { data && data.length > 1 && (<Root onCheckedChange={toggleSelectAll} className="CheckboxRoot" checked={data.length == selected.length}>
                            <Indicator>
                                <Check size={15} style={{ display: 'flex' }} />
                            </Indicator>
                        </Root>) }
                    </div>
                    <div style={{ width: '22%' }}>Name</div>
                    <div style={{ width: '32%' }}>Email</div>
                    <div style={{ width: '18%' }}>Role</div>
                    <div style={{ width: '25%' }}>Actions</div>
                </div>
            { data?.map((user) => (
                <ProjectUserRow
                    key={user.profiles.id}
                    i18n={props.i18n}
                    user={user}
                    typeId={user.type_id}
                    onRemoveUser={() => handleOpenRemoveModal(user.profiles.id, (user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') +user.profiles.last_name : user.profiles.nickname, user.type_id)}
                    onUpdateUser={(NewTypeId: string) => handleUpdateUser(user.profiles.id, user.type_id, NewTypeId)}
                    onSelectRow={() => handleToggleSelected(user.profiles.id)}
                    selected={selected.includes(user.profiles.id)}
                    roleName={projectGroups.find((i) => i.id == user.type_id).name}
                    onOpenEditModal={() => handleOpenEditModal(user.profiles.id, (user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') +user.profiles.last_name : user.profiles.nickname, user.type_id)}
                />
            ))}
            </div>
            <EditUserModal
                open={editModalOpen}
                id={currentlyEditing ? currentlyEditing.id : ''}
                name={currentlyEditing ? currentlyEditing.name : ''}
                type_id={currentlyEditing ? currentlyEditing.type_id : ''}
                projectGroups={projectGroups}
                onSubmit={(newId) => currentlyEditing && handleUpdateUser(currentlyEditing.id, currentlyEditing.type_id, newId)}
                onDelete={() => currentlyEditing && handleOpenRemoveModal(currentlyEditing.id, currentlyEditing.name, currentlyEditing.type_id)}
                onClose={() => { setEditModalOpen(false); setCurrentlyEditing(null) }}
            />
            <RemoveUserModal
                open={removeModalOpen}
                name={currentlyRemoving ? currentlyRemoving.name : undefined}
                onConfirm={() => currentlyRemoving && handleRemoveUser(currentlyRemoving.id, currentlyRemoving.typeId)}
                onClose={handleCloseRemoveModal}
            />
        </div>
    );
}