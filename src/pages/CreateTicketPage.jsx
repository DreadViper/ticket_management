export default function CreateTicketPage({
  canCreateTickets,
  currentUser,
  ticketDraft,
  assignableUsers,
  onDraftChange,
  onSubmit,
}) {
  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Create Ticket</p>
            <h2>New Engineering Ticket</h2>
            <p>
              QA, BA, and Admin users can raise tickets and assign them to FE Dev,
              BE Dev, or DevOps teammates.
            </p>
          </div>
          {!canCreateTickets && <span className="restriction-badge">Only QA, BA, and Admin can create</span>}
        </div>

        <form className="ticket-form" onSubmit={onSubmit}>
          <div className="read-only-note">
            <span>Creator</span>
            <strong>{currentUser?.name ?? "Unknown"} - {currentUser?.team ?? "No Team"}</strong>
          </div>

          <input
            type="text"
            placeholder="Ticket title"
            value={ticketDraft.title}
            onChange={(event) => onDraftChange("title", event.target.value)}
            disabled={!canCreateTickets}
          />

          <textarea
            rows="6"
            placeholder="Describe the issue or request"
            value={ticketDraft.description}
            onChange={(event) => onDraftChange("description", event.target.value)}
            disabled={!canCreateTickets}
          />

          <div className="ticket-form-grid">
            <label>
              Priority
              <select
                value={ticketDraft.priority}
                onChange={(event) => onDraftChange("priority", event.target.value)}
                disabled={!canCreateTickets}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </label>

            <label>
              Assign to
              <select
                value={ticketDraft.assignedToId}
                onChange={(event) => onDraftChange("assignedToId", event.target.value)}
                disabled={!canCreateTickets}
              >
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.team}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Initial status
              <select
                value={ticketDraft.status}
                onChange={(event) => onDraftChange("status", event.target.value)}
                disabled={!canCreateTickets}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
              </select>
            </label>
          </div>

          <button type="submit" disabled={!canCreateTickets}>
            Create Ticket
          </button>
        </form>
      </section>
    </section>
  );
}
