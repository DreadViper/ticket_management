import TeamCard from "../components/TeamCard";

export default function TeamsPage({ groupedUsers }) {
  return (
    <section className="page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Teams</p>
            <h2>Team Directory</h2>
            <p>Users are organized by team so assignment and ownership stay clear.</p>
          </div>
        </div>

        <div className="team-grid">
          {groupedUsers.map((group) => (
            <TeamCard key={group.team} team={group.team} members={group.members} />
          ))}
        </div>
      </section>
    </section>
  );
}
