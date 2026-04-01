import AdminComponent from "../components/AdminComponent";

export default function AdminPage({
  isAdmin,
  users,
  userDraft,
  teamOptions,
  lockedAdminUserId,
  onDraftChange,
  onSubmit,
  onUserUpdate,
}) {
  if (!isAdmin) {
    return (
      <section className="page-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Admin</p>
              <h2>Restricted Area</h2>
              <p>Only Admin users can create and manage users for each team.</p>
            </div>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Admin</p>
            <h2>User Administration</h2>
            <p>Admin owns sign-in creation, team mapping, and active status management.</p>
          </div>
        </div>

        <AdminComponent
          users={users}
          userDraft={userDraft}
          teamOptions={teamOptions}
          lockedAdminUserId={lockedAdminUserId}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
          onUserUpdate={onUserUpdate}
        />
      </section>
    </section>
  );
}
