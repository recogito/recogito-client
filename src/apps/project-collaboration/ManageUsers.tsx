import { listProjectUsers } from "@backend/crud";
import { supabase } from "@backend/supabaseBrowserClient";
import { useEffect, useState } from "react";
import type { Project, Translations } from "src/Types";
import './ManageUsers.css';


interface ManageUsersProps {

    i18n: Translations,

    project: Project

};

export const ManageUsers = (props: ManageUsersProps) => {
    const { t } = props.i18n;
    const { project } = props;

    const [data, setData] = useState<any[]>();

    const dummyData = [
        {
            profiles: {
                firstname: 'bob',
                lastname: 'smith',
                nickname: 'tim'
            },
            project_groups: {
                name: 'admin'
            }
        },
        {
            profiles: {
                firstname: 'bob2',
                lastname: 'smith2',
                nickname: 'tim2'
            },
            project_groups: {
                name: 'admin2'
            }
        }
    ];

    useEffect(() => {
        listProjectUsers(supabase, project.id).then((data) => {
            setData(data ? data : dummyData)
        })
    }, [])

    return (
        <div className="manage-users">
            <h1>Project Users</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                </tr>
                { data?.map((user) => (<tr><td>{user.profiles.nickname}</td><td>{user.project_groups.name}</td></tr>))}
            </table>
        </div>
    );
}