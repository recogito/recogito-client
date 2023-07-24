
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