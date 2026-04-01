export default function LoginPage({
  loginDraft,
  loginError,
  onDraftChange,
  onSubmit,
}) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">Authentication</p>
        <h1>Sign In to TicketFlow</h1>
        <p className="login-copy">
          Use the credentials created by Admin to access your team workspace.
        </p>

        <form className="login-form" onSubmit={onSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={loginDraft.email}
            onChange={(event) => onDraftChange("email", event.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginDraft.password}
            onChange={(event) => onDraftChange("password", event.target.value)}
          />
          <button type="submit">Sign In</button>
        </form>

        {loginError && <p className="form-error">{loginError}</p>}

        <div className="login-hint">
          <strong>Demo Admin Login</strong>
          <span>`riya.admin@ticketflow.dev` / `Admin@123`</span>
        </div>
      </section>
    </main>
  );
}
