import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';

const { Root, Portal, Overlay, Content, Title, Description, Close } = Dialog;

interface RemoveUserModalProps {
    open: boolean
    name?: string
    onConfirm(): void
    onClose(): void
}

const RemoveUserModal = (props: RemoveUserModalProps) => {
    const { open, name, onConfirm, onClose } = props;

    return (
        <Root open={open}>
            <Portal>
                <Overlay className='CollabDialogOverlay'>
                    <Content className='CollabDialogContent'>
                        <Title>Confirm Remove User</Title>
                        <Description>Are you sure you wish to remove the user {name ? name + ' ' : ''}from the project?</Description>
                        <button onClick={onConfirm}>Remove</button>
                        <button onClick={onClose}>Cancel</button>
                            <button className="CollabDialogClose" aria-label="Close" onClick={onClose}>
                                <X />
                            </button>
                    </Content>
                </Overlay>
            </Portal>
        </Root>
    )

};

export default RemoveUserModal;