import UserManagementTable from "./UserManagementTable";

export default function AdminComponent({
  users,
  userDraft,
  teamOptions,
  lockedAdminUserId,
  onDraftChange,
  onSubmit,
  onUserUpdate,
}) {
  return (
    <>
      <form className="admin-form" onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="User name"
          value={userDraft.name}
          onChange={(event) => onDraftChange("name", event.target.value)}
        />
        <input
          type="email"
          placeholder="User email"
          value={userDraft.email}
          onChange={(event) => onDraftChange("email", event.target.value)}
        />
        <input
          type="password"
          placeholder="Temporary password"
          value={userDraft.password}
          onChange={(event) => onDraftChange("password", event.target.value)}
        />
        <select
          value={userDraft.team}
          onChange={(event) => onDraftChange("team", event.target.value)}
        >
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
        <button type="submit">Create Sign In</button>
      </form>

      <UserManagementTable
        users={users}
        teamOptions={teamOptions}
        lockedAdminUserId={lockedAdminUserId}
        onUserUpdate={onUserUpdate}
      />
    </>
  );
}
