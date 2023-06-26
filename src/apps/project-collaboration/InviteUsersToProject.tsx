import { Toast, ToastContent, ToastProvider } from "@components/Toast";
import { useFormik } from "formik";
import { useState } from "react";
import { supabase } from "@backend/supabaseBrowserClient";
import type { Project, Translations } from "src/Types";
import './InviteUsersToProject.css';
import { inviteUserToProject } from "@backend/crud";



interface InviteUsersToProjectProps {

    i18n: Translations,

    project: Project

}


export const InviteUsersToProject = (props: InviteUsersToProjectProps) => {

    const { t } = props.i18n;

    const { project } = props;

    const [error, setError] = useState<ToastContent | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            role: 'Project Student',
            projectId: project.id
        },

        onSubmit: values => {
            inviteUserToProject(supabase, values.email, project.id, values.role).then((result) => {
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
            </div>
            <Toast
                content={error}
                onOpenChange={open => !open && setError(null)} />
        </ToastProvider>
    );
}

export default InviteUsersToProject;

