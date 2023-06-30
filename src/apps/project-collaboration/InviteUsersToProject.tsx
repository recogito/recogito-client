import { Toast, ToastContent, ToastProvider } from "@components/Toast";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { supabase } from "@backend/supabaseBrowserClient";
import type { Project, Translations, UserProfile } from "src/Types";
import './InviteUsersToProject.css';
import { inviteUserToProject, listPendingInvites } from "@backend/crud";



interface InviteUsersToProjectProps {

    i18n: Translations,

    project: Project,

    user: UserProfile

}


export const InviteUsersToProject = (props: InviteUsersToProjectProps) => {

    const { t } = props.i18n;

    const { project, user } = props;

    const [error, setError] = useState<ToastContent | null>(null);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);

    useEffect(() => {
        listPendingInvites(supabase, project.id).then((data) => data && setPendingInvites(data.map((i) => i.email)));
    }, []);

    const formik = useFormik({
        initialValues: {
            email: '',
            role: 'Project Student',
            projectId: project.id
        },

        onSubmit: values => {
            console.log(values);
            const invited_by_name = user.nickname ? user.nickname : user.last_name ? (user.first_name ? user.first_name + ' ' : '') + user.last_name : undefined;
            inviteUserToProject(supabase, values.email, project.id, values.role, invited_by_name, project.name).then((result) => {
                if (result?.error) {
                  console.error(result.error);
                  setError({ 
                    title: t['Something went wrong'], 
                    description: t['Could not invite user.'], 
                    type: 'error' 
                  });
                } else {
                  setError({ 
                    title: t['User invited'], 
                    type: 'success' 
                  });
                  setPendingInvites((old) => [...old, values.email]);
                }
                // TODO error handling
                // if (result?.data) {
                // console.log(result.data);
                // }
              });
        }
    });


    return (
        <ToastProvider>
            <div className="collaboration">
                <h1>{t['Invite Users to Project']}</h1>
                <form onSubmit={formik.handleSubmit}>
                    <fieldset>
                    <div className="field">
                        <label>{t['E-Mail']}</label>
                        <input 
                            id="email"
                            name="email"
                            type="email" 
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>{t['Role']}</label>
                        <select id="role" name="role" onChange={formik.handleChange} value={formik.values.role}>
                            <option value="Project Student">{t['Student']}</option>
                            <option value="Project Admin">{t['Professor']}</option>
                            <option value="TA">{t['TA']}</option>
                            <option value="Auditor">{t['Auditor']}</option>
                        </select>
                    </div>
                    </fieldset>
                    <button className="primary" type="submit">{t['Invite']}</button>
                </form>
            { pendingInvites.length > 0 && (
                <div style={{ marginTop: 40 }}>
                    <h2>Invited Users: Pending</h2>
                    <ul>
                        { pendingInvites.map((i) => (
                            <li key={i}>{i}</li>
                        ))}
                    </ul>
                </div>
            )}
            </div>
            <Toast
                content={error}
                onOpenChange={open => !open && setError(null)} />
        </ToastProvider>
    );
}

export default InviteUsersToProject;

