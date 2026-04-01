import { useEffect, useMemo, useState } from "react";
import { navigationItems, teamOptions } from "./data/seed";
import { getDefaultPageForUser, getPermissions } from "./auth/rbac";
import HeaderBar from "./components/HeaderBar";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import TicketsPage from "./pages/TicketsPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TeamsPage from "./pages/TeamsPage";
import AdminPage from "./pages/AdminPage";

const engineeringTeams = new Set(["FE Dev", "BE Dev", "DevOps"]);
const LOCKED_ADMIN_USER_ID = 1;

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

function createInitialTicketDraft(users) {
  const firstEngineer = users.find((user) => engineeringTeams.has(user.team));

  return {
    title: "",
    description: "",
    priority: "Medium",
    assignedToId: firstEngineer?.id ?? "",
    status: "Open",
  };
}

function getUserById(users, userId) {
  return users.find((user) => user.id === userId);
}

export default function App() {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activePage, setActivePage] = useState("tickets");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [ticketDraft, setTicketDraft] = useState(() => createInitialTicketDraft([]));
  const [commentDraft, setCommentDraft] = useState("");
  const [loginDraft, setLoginDraft] = useState({
    email: "",
    password: "",
  });
  const [loginError, setLoginError] = useState("");
  const [appError, setAppError] = useState("");
  const [userDraft, setUserDraft] = useState({
    name: "",
    team: "QA",
    email: "",
    password: "",
  });

  const currentUser = getUserById(users, currentUserId) ?? null;
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
  const assignableUsers = users.filter((user) => engineeringTeams.has(user.team) && user.active);
  const currentPermissions = useMemo(
    () => getPermissions(currentUser, selectedTicket),
    [currentUser, selectedTicket],
  );
  const canCreateTickets = currentPermissions.canCreateTickets;
  const isAdmin = currentPermissions.canManageUsers;
  const visibleNavigationItems = navigationItems.filter((item) =>
    currentPermissions.canViewPage(item.id),
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (!currentPermissions.canViewPage(activePage)) {
      setActivePage(getDefaultPageForUser(currentUser));
    }
  }, [activePage, currentPermissions, currentUser]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const nextUser = getUserById(users, currentUserId);

    if (!nextUser || !nextUser.active) {
      setCurrentUserId(null);
      setActivePage("tickets");
      setCommentDraft("");
      setUsers([]);
      setTickets([]);
    }
  }, [currentUserId, users]);

  useEffect(() => {
    setTicketDraft(createInitialTicketDraft(users));
  }, [users]);

  function applyServerState(data) {
    setUsers(data.users ?? []);
    setTickets(data.tickets ?? []);
    setSelectedTicketId((currentId) => {
      const nextTickets = data.tickets ?? [];

      if (nextTickets.length === 0) {
        return null;
      }

      if (currentId && nextTickets.some((ticket) => ticket.id === currentId)) {
        return currentId;
      }

      return nextTickets[0].id;
    });
  }

  function updateLoginDraft(field, value) {
    setLoginDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  async function login(event) {
    event.preventDefault();

    try {
      const data = await apiRequest("/api/login", {
        method: "POST",
        body: loginDraft,
      });

      applyServerState(data);
      setCurrentUserId(data.user.id);
      setActivePage(getDefaultPageForUser(data.user));
      setLoginDraft({
        email: "",
        password: "",
      });
      setLoginError("");
      setAppError("");
    } catch (error) {
      setLoginError(error.message);
    }
  }

  function logout() {
    setCurrentUserId(null);
    setCommentDraft("");
    setUsers([]);
    setTickets([]);
    setLoginDraft({
      email: "",
      password: "",
    });
    setLoginError("");
    setAppError("");
  }

  function openTicket(ticketId) {
    if (!currentPermissions.canViewPage("ticket-details")) {
      return;
    }

    setSelectedTicketId(ticketId);
    setActivePage("ticket-details");
  }

  function updateTicketDraft(field, value) {
    setTicketDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  function updateUserDraft(field, value) {
    setUserDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }));
  }

  async function createTicket(event) {
    event.preventDefault();

    if (!canCreateTickets) {
      return;
    }

    const title = ticketDraft.title.trim();
    const description = ticketDraft.description.trim();
    const assignee = getUserById(users, Number(ticketDraft.assignedToId));

    if (!title || !description || !assignee) {
      return;
    }

    try {
      const data = await apiRequest("/api/tickets", {
        method: "POST",
        body: {
          actingUserId: currentUser.id,
          title,
          description,
          priority: ticketDraft.priority,
          status: ticketDraft.status,
          assignedToId: assignee.id,
        },
      });

      applyServerState(data);
      setSelectedTicketId(data.tickets?.[0]?.id ?? null);
      setActivePage("ticket-details");
      setTicketDraft(createInitialTicketDraft(data.users ?? users));
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function updateTicketStatus(ticketId, status) {
    const ticket = tickets.find((entry) => entry.id === ticketId);
    const permissions = getPermissions(currentUser, ticket);

    if (!permissions.canUpdateTicketStatus) {
      return;
    }

    try {
      const data = await apiRequest(`/api/tickets/${ticketId}/status`, {
        method: "PATCH",
        body: {
          actingUserId: currentUser.id,
          status,
        },
      });

      applyServerState(data);
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function reassignTicket(ticketId, assignedToId) {
    const ticket = tickets.find((entry) => entry.id === ticketId);
    const permissions = getPermissions(currentUser, ticket);

    if (!permissions.canAssignTickets) {
      return;
    }

    try {
      const data = await apiRequest(`/api/tickets/${ticketId}/assignment`, {
        method: "PATCH",
        body: {
          actingUserId: currentUser.id,
          assignedToId: Number(assignedToId),
        },
      });

      applyServerState(data);
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function addComment() {
    const text = commentDraft.trim();

    if (!text || !selectedTicket || !currentUser || !currentPermissions.canComment) {
      return;
    }

    try {
      const data = await apiRequest(`/api/tickets/${selectedTicket.id}/comments`, {
        method: "POST",
        body: {
          actingUserId: currentUser.id,
          text,
        },
      });

      applyServerState(data);
      setCommentDraft("");
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function createUser(event) {
    event.preventDefault();

    if (!isAdmin) {
      return;
    }

    const name = userDraft.name.trim();
    const email = userDraft.email.trim();
    const password = userDraft.password.trim();

    if (!name || !email || !password) {
      return;
    }

    try {
      const data = await apiRequest("/api/users", {
        method: "POST",
        body: {
          actingUserId: currentUser.id,
          name,
          email,
          password,
          team: teamOptions.includes(userDraft.team) ? userDraft.team : "QA",
        },
      });

      applyServerState(data);
      setUserDraft({
        name: "",
        team: "QA",
        email: "",
        password: "",
      });
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  async function updateUser(userId, updates) {
    if (!isAdmin) {
      return;
    }

    if (userId === LOCKED_ADMIN_USER_ID) {
      return;
    }

    const safeUpdates = { ...updates };

    if (safeUpdates.team === "Admin") {
      delete safeUpdates.team;
    }

    try {
      const data = await apiRequest(`/api/users/${userId}`, {
        method: "PATCH",
        body: {
          actingUserId: currentUser.id,
          updates: safeUpdates,
        },
      });

      applyServerState(data);
      setAppError("");
    } catch (error) {
      setAppError(error.message);
    }
  }

  function groupedUsersByTeam() {
    return teamOptions.map((team) => ({
      team,
      members: users.filter((user) => user.team === team),
    }));
  }

  function renderPage() {
    switch (activePage) {
      case "tickets":
        return (
          <TicketsPage
            tickets={tickets}
            users={users}
            onOpenTicket={openTicket}
          />
        );
      case "ticket-details":
        return (
          <TicketDetailsPage
            ticket={selectedTicket}
            users={users}
            assignableUsers={assignableUsers}
            permissions={currentPermissions}
            commentDraft={commentDraft}
            onCommentDraftChange={setCommentDraft}
            onAddComment={addComment}
            onStatusChange={updateTicketStatus}
            onAssignChange={reassignTicket}
            onBackToList={() => setActivePage("tickets")}
          />
        );
      case "create-ticket":
        return (
          <CreateTicketPage
            canCreateTickets={canCreateTickets}
            currentUser={currentUser}
            ticketDraft={ticketDraft}
            assignableUsers={assignableUsers}
            onDraftChange={updateTicketDraft}
            onSubmit={createTicket}
          />
        );
      case "teams":
        return <TeamsPage groupedUsers={groupedUsersByTeam()} />;
      case "admin":
        return (
          <AdminPage
            isAdmin={isAdmin}
            users={users}
            userDraft={userDraft}
            teamOptions={teamOptions}
            lockedAdminUserId={LOCKED_ADMIN_USER_ID}
            onDraftChange={updateUserDraft}
            onSubmit={createUser}
            onUserUpdate={updateUser}
          />
        );
      default:
        return null;
    }
  }

  if (!currentUser) {
    return (
      <LoginPage
        loginDraft={loginDraft}
        loginError={loginError}
        onDraftChange={updateLoginDraft}
        onSubmit={login}
      />
    );
  }

  return (
    <main className="app-shell">
      <Sidebar
        items={visibleNavigationItems}
        activePage={activePage}
        onNavigate={setActivePage}
      />

      <section className="workspace">
        <HeaderBar
          currentUser={currentUser}
          permissions={currentPermissions}
          appError={appError}
          onLogout={logout}
        />
        {renderPage()}
      </section>
    </main>
  );
}
