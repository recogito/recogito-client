import { getProjectGroups, listProjectUsers, updateUserProjectGroup } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import { useEffect, useState } from "react";
import type { Project, Translations } from "src/Types";
import './ManageUsers.css';
import { ProjectUserRow } from "@components/ProjectUserRow";


interface ManageUsersProps {

    i18n: Translations,

    project: Project

};

export const ManageUsers = (props: ManageUsersProps) => {
    const { t } = props.i18n;
    const { project } = props;

    const [data, setData] = useState<any[]>();
    const [projectGroups, setProjectGroups] = useState<any[]>([]);

    const handleRemoveUser = (id: string) => {
        console.log('user ' + id + ' has been removed');
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
            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                </tr>
                </thead>
                <tbody>
                { data?.map((user) => (
                    <ProjectUserRow
                        key={user.profiles.id}
                        i18n={props.i18n}
                        user={user}
                        projectId={project.id}
                        typeId={user.type_id}
                        projectGroups={projectGroups}
                        onRemoveUser={() => handleRemoveUser(user.profiles.id)}
                        onUpdateUser={(typeId: string) => handleUpdateUser(user.profiles.id, user.type_id, typeId)}
                    />
                ))}
                </tbody>
            </table>
        </div>
    );
}