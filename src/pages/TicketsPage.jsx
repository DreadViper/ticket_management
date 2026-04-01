import StatCard from "../components/StatCard";
import TicketListItem from "../components/TicketListItem";

export default function TicketsPage({ tickets, users, onOpenTicket }) {
  const stats = {
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === "Open").length,
    inProgress: tickets.filter((ticket) => ticket.status === "In Progress").length,
    closed: tickets.filter((ticket) => ticket.status === "Closed").length,
  };

  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Tickets</p>
            <h2>Ticket List</h2>
            <p>Only compact ticket rows are shown here: title and assignee.</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Open" value={stats.open} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Closed" value={stats.closed} />
        </div>

        <div className="ticket-compact-list">
          {tickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              ticket={ticket}
              users={users}
              onOpen={onOpenTicket}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
