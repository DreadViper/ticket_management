export default function TeamCard({ team, members }) {
  return (
    <article className="team-card">
      <div className="team-card-header">
        <h3>{team}</h3>
        <span>{members.length} members</span>
      </div>

      <div className="team-member-list">
        {members.length > 0 ? (
          members.map((member) => (
            <div className="team-member-row" key={member.id}>
              <strong>{member.name}</strong>
              <span>{member.email}</span>
            </div>
          ))
        ) : (
          <p className="empty-state">No users in this team yet.</p>
        )}
      </div>
    </article>
  );
}
