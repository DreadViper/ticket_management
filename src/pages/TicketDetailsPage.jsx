function getUser(users, userId) {
  return users.find((user) => user.id === userId);
}

export default function TicketDetailsPage({
  ticket,
  users,
  assignableUsers,
  permissions,
  commentDraft,
  onCommentDraftChange,
  onAddComment,
  onStatusChange,
  onAssignChange,
  onBackToList,
}) {
  if (!ticket) {
    return (
      <section className="page-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Ticket Details</p>
              <h2>No Ticket Selected</h2>
              <p>Open a ticket from the ticket list to view the full workflow.</p>
            </div>
            <button type="button" onClick={onBackToList}>
              Go to Tickets
            </button>
          </div>
        </section>
      </section>
    );
  }

  const creator = getUser(users, ticket.createdById);
  const assignee = getUser(users, ticket.assignedToId);

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Ticket Details</p>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
          </div>
          <button type="button" onClick={onBackToList}>
            Back to Ticket List
          </button>
        </div>

        <div className="detail-grid">
          <article className="detail-card">
            <h3>Assignment</h3>
            <p>Created by {creator?.name ?? "Unknown"} ({creator?.team ?? "No Team"})</p>
            <label>
              Assigned engineer
              <select
                value={ticket.assignedToId}
                onChange={(event) => onAssignChange(ticket.id, event.target.value)}
                disabled={!permissions?.canAssignTickets}
              >
                {assignableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.team}
                  </option>
                ))}
              </select>
            </label>
            <p>Current owner: {assignee?.name ?? "Unknown"} ({assignee?.team ?? "No Team"})</p>
          </article>

          <article className="detail-card">
            <h3>Status</h3>
            <label>
              Workflow state
              <select
                value={ticket.status}
                onChange={(event) => onStatusChange(ticket.id, event.target.value)}
                disabled={!permissions?.canUpdateTicketStatus}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Closed">Closed</option>
              </select>
            </label>
            <div className="tag-row">
              <span className={`tag priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
              <span className="tag status-tag">{ticket.status}</span>
            </div>
            {!permissions?.canUpdateTicketStatus && (
              <p className="empty-state">
                Only the ticket assignee, creator, or Admin can update the status.
              </p>
            )}
          </article>
        </div>

        <article className="detail-card">
          <div className="panel-heading">
            <div>
              <h3>Comments</h3>
              <p>Comments can be added by anyone, but there is no delete action.</p>
            </div>
          </div>

          <div className="comment-list">
            {ticket.comments.length > 0 ? (
              ticket.comments.map((comment) => {
                const author = getUser(users, comment.authorId);

                return (
                  <div className="comment-card" key={comment.id}>
                    <div className="comment-author">
                      <strong>{author?.name ?? "Unknown"}</strong>
                      <span>{author?.team ?? "No Team"}</span>
                    </div>
                    <p>{comment.text}</p>
                  </div>
                );
              })
            ) : (
              <p className="empty-state">No comments yet for this ticket.</p>
            )}
          </div>

          <div className="comment-form">
            <textarea
              rows="4"
              value={commentDraft}
              onChange={(event) => onCommentDraftChange(event.target.value)}
              placeholder="Add a permanent comment to this ticket..."
              disabled={!permissions?.canComment}
            />
            <button type="button" onClick={onAddComment} disabled={!permissions?.canComment}>
              Add Comment
            </button>
          </div>
        </article>
      </section>
    </section>
  );
}
