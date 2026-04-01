const teamPermissions = {
  Admin: {
    pages: ["tickets", "ticket-details", "create-ticket", "teams", "admin"],
    canCreateTickets: true,
    canComment: true,
    canAssignTickets: true,
    canUpdateAnyTicketStatus: true,
    canManageUsers: true,
  },
  QA: {
    pages: ["tickets", "ticket-details", "create-ticket", "teams"],
    canCreateTickets: true,
    canComment: true,
    canAssignTickets: true,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  },
  BA: {
    pages: ["tickets", "ticket-details", "create-ticket", "teams"],
    canCreateTickets: true,
    canComment: true,
    canAssignTickets: true,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  },
  "FE Dev": {
    pages: ["tickets", "ticket-details", "teams"],
    canCreateTickets: false,
    canComment: true,
    canAssignTickets: false,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  },
  "BE Dev": {
    pages: ["tickets", "ticket-details", "teams"],
    canCreateTickets: false,
    canComment: true,
    canAssignTickets: false,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  },
  DevOps: {
    pages: ["tickets", "ticket-details", "teams"],
    canCreateTickets: false,
    canComment: true,
    canAssignTickets: false,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  },
};

function getTeamPolicy(team) {
  return teamPermissions[team] ?? {
    pages: ["tickets"],
    canCreateTickets: false,
    canComment: false,
    canAssignTickets: false,
    canUpdateAnyTicketStatus: false,
    canManageUsers: false,
  };
}

export function getPermissions(user, ticket) {
  const policy = getTeamPolicy(user?.team);
  const isAssignee = Boolean(ticket && user && ticket.assignedToId === user.id);
  const isCreator = Boolean(ticket && user && ticket.createdById === user.id);

  return {
    pages: policy.pages,
    canViewPage(pageId) {
      return policy.pages.includes(pageId);
    },
    canCreateTickets: policy.canCreateTickets,
    canComment: policy.canComment,
    canManageUsers: policy.canManageUsers,
    canAssignTickets: policy.canAssignTickets || policy.canManageUsers,
    canUpdateTicketStatus:
      policy.canUpdateAnyTicketStatus || isAssignee || isCreator || policy.canManageUsers,
    canEditUser: policy.canManageUsers,
    isAssignee,
    isCreator,
  };
}

export function getDefaultPageForUser(user) {
  const policy = getTeamPolicy(user?.team);

  if (policy.pages.includes("tickets")) {
    return "tickets";
  }

  return policy.pages[0] ?? "tickets";
}
