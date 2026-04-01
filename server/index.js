import http from "node:http";
import { getPermissions } from "../src/auth/rbac.js";
import { loadState, saveState, sanitizeUser, sanitizeUsers, verifyPassword, createStoredUser } from "./storage.js";
import { LOCKED_ADMIN_USER_ID } from "./seed.js";

const port = Number(process.env.PORT ?? 3001);
const engineeringTeams = new Set(["FE Dev", "BE Dev", "DevOps"]);
const allowedTeams = new Set(["QA", "BA", "FE Dev", "BE Dev", "DevOps"]);

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, message) {
  sendJson(res, statusCode, { error: message });
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function findUser(state, userId) {
  return state.users.find((user) => user.id === Number(userId));
}

function baseStateResponse(state) {
  return {
    users: sanitizeUsers(state.users),
    tickets: state.tickets,
    lockedAdminUserId: LOCKED_ADMIN_USER_ID,
  };
}

function requireActor(state, actingUserId) {
  const actor = findUser(state, actingUserId);

  if (!actor || !actor.active) {
    return null;
  }

  return actor;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    sendJson(res, 200, { ok: true });
    return;
  }

  try {
    if (req.method === "POST" && url.pathname === "/api/login") {
      const state = loadState();
      const body = await getRequestBody(req);
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const user = state.users.find(
        (entry) => entry.email.toLowerCase() === email && entry.active,
      );

      if (!user || !verifyPassword(password, user)) {
        sendError(res, 401, "Invalid email or password.");
        return;
      }

      sendJson(res, 200, {
        user: sanitizeUser(user),
        ...baseStateResponse(state),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/users") {
      const state = loadState();
      const body = await getRequestBody(req);
      const actor = requireActor(state, body.actingUserId);

      if (!actor || actor.id !== LOCKED_ADMIN_USER_ID) {
        sendError(res, 403, "Only the system admin can create users.");
        return;
      }

      const name = String(body.name ?? "").trim();
      const email = String(body.email ?? "").trim();
      const password = String(body.password ?? "").trim();
      const team = String(body.team ?? "");

      if (!name || !email || !password || !allowedTeams.has(team)) {
        sendError(res, 400, "Missing or invalid user fields.");
        return;
      }

      const emailExists = state.users.some(
        (user) => user.email.toLowerCase() === email.toLowerCase(),
      );

      if (emailExists) {
        sendError(res, 409, "A user with that email already exists.");
        return;
      }

      state.users.push(
        createStoredUser({
          id: Date.now(),
          name,
          email,
          password,
          team,
          active: true,
        }),
      );

      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    if (req.method === "PATCH" && url.pathname.startsWith("/api/users/")) {
      const state = loadState();
      const body = await getRequestBody(req);
      const actor = requireActor(state, body.actingUserId);
      const targetUserId = Number(url.pathname.split("/").pop());
      const targetUser = findUser(state, targetUserId);

      if (!actor || actor.id !== LOCKED_ADMIN_USER_ID) {
        sendError(res, 403, "Only the system admin can manage users.");
        return;
      }

      if (!targetUser) {
        sendError(res, 404, "User not found.");
        return;
      }

      if (targetUser.id === LOCKED_ADMIN_USER_ID) {
        sendError(res, 403, "The system admin account is locked.");
        return;
      }

      const updates = { ...(body.updates ?? {}) };

      if (updates.team && !allowedTeams.has(updates.team)) {
        delete updates.team;
      }

      if (updates.team === "Admin") {
        delete updates.team;
      }

      Object.assign(targetUser, updates);
      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/tickets") {
      const state = loadState();
      const body = await getRequestBody(req);
      const actor = requireActor(state, body.actingUserId);

      if (!actor) {
        sendError(res, 403, "Invalid user.");
        return;
      }

      const permissions = getPermissions(actor, null);

      if (!permissions.canCreateTickets) {
        sendError(res, 403, "You do not have permission to create tickets.");
        return;
      }

      const title = String(body.title ?? "").trim();
      const description = String(body.description ?? "").trim();
      const assignee = findUser(state, body.assignedToId);

      if (!title || !description || !assignee || !engineeringTeams.has(assignee.team)) {
        sendError(res, 400, "Missing or invalid ticket fields.");
        return;
      }

      state.tickets.unshift({
        id: Date.now(),
        title,
        description,
        priority: body.priority,
        status: body.status,
        createdById: actor.id,
        assignedToId: assignee.id,
        comments: [],
      });

      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    if (req.method === "PATCH" && url.pathname.match(/^\/api\/tickets\/\d+\/status$/)) {
      const state = loadState();
      const body = await getRequestBody(req);
      const ticketId = Number(url.pathname.split("/")[3]);
      const actor = requireActor(state, body.actingUserId);
      const ticket = state.tickets.find((entry) => entry.id === ticketId);

      if (!actor || !ticket) {
        sendError(res, 404, "Ticket not found.");
        return;
      }

      const permissions = getPermissions(actor, ticket);

      if (!permissions.canUpdateTicketStatus) {
        sendError(res, 403, "You do not have permission to update this ticket.");
        return;
      }

      ticket.status = String(body.status ?? ticket.status);
      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    if (req.method === "PATCH" && url.pathname.match(/^\/api\/tickets\/\d+\/assignment$/)) {
      const state = loadState();
      const body = await getRequestBody(req);
      const ticketId = Number(url.pathname.split("/")[3]);
      const actor = requireActor(state, body.actingUserId);
      const ticket = state.tickets.find((entry) => entry.id === ticketId);
      const assignee = findUser(state, body.assignedToId);

      if (!actor || !ticket) {
        sendError(res, 404, "Ticket not found.");
        return;
      }

      const permissions = getPermissions(actor, ticket);

      if (!permissions.canAssignTickets) {
        sendError(res, 403, "You do not have permission to assign this ticket.");
        return;
      }

      if (!assignee || !assignee.active || !engineeringTeams.has(assignee.team)) {
        sendError(res, 400, "Invalid assignee.");
        return;
      }

      ticket.assignedToId = assignee.id;
      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    if (req.method === "POST" && url.pathname.match(/^\/api\/tickets\/\d+\/comments$/)) {
      const state = loadState();
      const body = await getRequestBody(req);
      const ticketId = Number(url.pathname.split("/")[3]);
      const actor = requireActor(state, body.actingUserId);
      const ticket = state.tickets.find((entry) => entry.id === ticketId);

      if (!actor || !ticket) {
        sendError(res, 404, "Ticket not found.");
        return;
      }

      const permissions = getPermissions(actor, ticket);
      const text = String(body.text ?? "").trim();

      if (!permissions.canComment || !text) {
        sendError(res, 403, "You do not have permission to comment on this ticket.");
        return;
      }

      ticket.comments.push({
        id: Date.now(),
        authorId: actor.id,
        text,
      });

      saveState(state);
      sendJson(res, 200, baseStateResponse(state));
      return;
    }

    sendError(res, 404, "Not found.");
  } catch (error) {
    sendError(res, 500, error.message || "Unexpected server error.");
  }
});

server.listen(port, () => {
  console.log(`TicketFlow API running on http://localhost:${port}`);
});
