import * as Dialog from '@radix-ui/react-dialog';
import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { X } from '@phosphor-icons/react';

const { Root, Portal, Overlay, Content, Title, Description, Close } = Dialog;

interface EditUserModalProps {
    open: boolean
    id: string
    name?: string
    type_id: string
    projectGroups: { id: string, name: string }[]
    onSubmit: (newTypeId: string) => void
    onDelete(): void
    onClose(): void
}

const EditUserModal = (props: EditUserModalProps) => {
    const { open, name, type_id, projectGroups, onSubmit, onDelete, onClose } = props;
    const [ newTypeId, setNewTypeId ] = useState<string>(props.type_id);

    const currentGroup = projectGroups.find((i) => i.id == type_id);
    const currentRole = currentGroup ? currentGroup.name : 'unassigned';

    useEffect(() => setNewTypeId(type_id), [props.type_id]);

    const handleUpdateTypeId = (evt: ChangeEvent<HTMLSelectElement>) => setNewTypeId(evt.target.value);

    const handleSubmit = (evt: FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        const form = evt.currentTarget;
        const formElements = form.elements as typeof form.elements & {
            type_id: HTMLInputElement
        };
        onSubmit(formElements.type_id.value);
    }

    return (
        <Root open={open}>
            <Portal>
                <Overlay className='CollabDialogOverlay'>
                    <Content className='CollabDialogContent'>
                        <Title>Edit Project User {name}</Title>
                        <Description>Current role: {currentRole}</Description>
                        <form onSubmit={handleSubmit}>
                            <select id="type_id" name="type_id" onChange={handleUpdateTypeId} value={newTypeId}>
                                { projectGroups.map((group) => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                            <button className="primary" type="submit" disabled={newTypeId == type_id}>Update</button>
                        </form>
                        <button onClick={onDelete}>Remove User</button>
                            <button className="CollabDialogClose" aria-label="Close" onClick={onClose}>
                                <X />
                            </button>
                    </Content>
                </Overlay>
            </Portal>
        </Root>
    )

};

export default EditUserModal;