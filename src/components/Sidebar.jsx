export default function Sidebar({ items, activePage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark">TF</span>
        <div>
          <strong>TicketFlow</strong>
          <p>Engineering teams</p>
        </div>
      </div>

      <nav className="nav-list">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activePage ? "nav-button active" : "nav-button"}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
