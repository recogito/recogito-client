import { useFormik } from "formik";
import type { Translations, UserProfile } from "src/Types";
import './ProjectUserRow.css';


interface ProjectUserRowProps {
    i18n: Translations
    user: any
    projectId: string
    typeId: string
    projectGroups: { id: string, name: string }[]
    onRemoveUser(): void
    onUpdateUser: (typeId: string) => void
}

export const ProjectUserRow = (props: ProjectUserRowProps) => {
    const { t } = props.i18n;
    const { user, projectId, typeId, projectGroups, onRemoveUser, onUpdateUser } = props;

    const formik = useFormik({
        initialValues: {
            user_id: user.profiles.id,
            type_id: typeId
        },

        onSubmit: values => {
            onUpdateUser(values.type_id);
        }
    });

    return (
        <tr>
            <td>{(user.profiles.first_name || user.profiles.last_name) ? (user.profiles.first_name ? `${user.profiles.first_name} ` : '') +user.profiles.last_name : user.profiles.nickname}</td>
        <td className="edit-role"><form onSubmit={formik.handleSubmit}>
        <select id="type_id" name="type_id" onChange={formik.handleChange} value={formik.values.type_id} className={formik.values.type_id != typeId ? 'modified' : ''}>
            { projectGroups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
            ))}
        </select>
        <button className="primary" type="submit" disabled={formik.values.type_id == typeId}>Update</button>
        </form>
        <button onClick={onRemoveUser} className="warning">Remove</button>
        </td>
        </tr>
    )


}