export default function UserManagementTable({
  users,
  teamOptions,
  lockedAdminUserId,
  onUserUpdate,
}) {
  return (
    <div className="user-table">
      {users.map((user) => (
        <div className="user-row" key={user.id}>
          <div>
            <strong>{user.name}</strong>
            <p>{user.email}</p>
          </div>

          <label>
            Team
            <select
              value={user.team}
              disabled={user.id === lockedAdminUserId}
              onChange={(event) => onUserUpdate(user.id, { team: event.target.value })}
            >
              {(user.id === lockedAdminUserId ? ["Admin", ...teamOptions] : teamOptions).map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              value={user.active ? "Active" : "Inactive"}
              disabled={user.id === lockedAdminUserId}
              onChange={(event) =>
                onUserUpdate(user.id, { active: event.target.value === "Active" })
              }
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}
