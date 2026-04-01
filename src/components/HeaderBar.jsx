export default function HeaderBar({ currentUser, permissions, appError, onLogout }) {
  return (
    <header className="header-bar">
      <div className="header-main">
        <p className="eyebrow">Single Page App</p>
        <h1>TicketFlow Workspace</h1>
        <div className="header-permissions">
          <span className="tag status-tag">{currentUser?.team ?? "No Team"}</span>
          {permissions?.canCreateTickets && <span className="tag priority-low">Can Create Tickets</span>}
          {permissions?.canManageUsers && <span className="tag priority-medium">Admin Access</span>}
        </div>
        {appError && <p className="banner-error">{appError}</p>}
      </div>

      <div className="header-user-card">
        <label>Signed in as</label>
        <div className="session-card">
          <strong>{currentUser?.name ?? "Unknown"}</strong>
          <span>{currentUser?.email ?? "No email"}</span>
        </div>
        <button type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
