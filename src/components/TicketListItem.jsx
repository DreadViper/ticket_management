function getUserName(users, userId) {
  return users.find((user) => user.id === userId)?.name ?? "Unassigned";
}

function getUserTeam(users, userId) {
  return users.find((user) => user.id === userId)?.team ?? "No Team";
}

export default function TicketListItem({ ticket, users, onOpen }) {
  return (
    <button type="button" className="ticket-list-item" onClick={() => onOpen(ticket.id)}>
      <div>
        <h3>{ticket.title}</h3>
        <p>Assigned to {getUserName(users, ticket.assignedToId)}</p>
      </div>
      <div className="ticket-list-meta">
        <span className={`tag priority-${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
        <span className="subtle-text">{getUserTeam(users, ticket.assignedToId)}</span>
      </div>
    </button>
  );
}
