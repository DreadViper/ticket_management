export const LOCKED_ADMIN_USER_ID = 1;

export const seedUsers = [
  {
    id: LOCKED_ADMIN_USER_ID,
    name: "Riya Admin",
    email: "riya.admin@ticketflow.dev",
    password: "Admin@123",
    team: "Admin",
    active: true,
  },
  {
    id: 2,
    name: "Nina QA",
    email: "nina.qa@ticketflow.dev",
    password: "Qa@123",
    team: "QA",
    active: true,
  },
  {
    id: 3,
    name: "Arjun BA",
    email: "arjun.ba@ticketflow.dev",
    password: "Ba@123",
    team: "BA",
    active: true,
  },
  {
    id: 4,
    name: "Maya FE",
    email: "maya.fe@ticketflow.dev",
    password: "Fe@123",
    team: "FE Dev",
    active: true,
  },
  {
    id: 5,
    name: "Kabir BE",
    email: "kabir.be@ticketflow.dev",
    password: "Be@123",
    team: "BE Dev",
    active: true,
  },
  {
    id: 6,
    name: "Sara DevOps",
    email: "sara.devops@ticketflow.dev",
    password: "Devops@123",
    team: "DevOps",
    active: true,
  },
];

export const seedTickets = [
  {
    id: 201,
    title: "Checkout form breaks on tablet width",
    description:
      "QA found that the checkout form collapses incorrectly between 768px and 900px.",
    priority: "High",
    status: "Open",
    createdById: 2,
    assignedToId: 4,
    comments: [
      { id: 1, authorId: 2, text: "Reproducible on iPad Air in portrait mode." },
      { id: 2, authorId: 4, text: "I am checking the responsive grid rules." },
    ],
  },
  {
    id: 202,
    title: "Order API needs idempotency support",
    description:
      "BA requested safer retry handling for duplicate submissions during peak traffic.",
    priority: "Critical",
    status: "In Progress",
    createdById: 3,
    assignedToId: 5,
    comments: [
      { id: 3, authorId: 3, text: "This is needed before finance sign-off." },
    ],
  },
  {
    id: 203,
    title: "Deployment pipeline should notify Slack on rollback",
    description:
      "Release operations need a rollback alert in the engineering Slack channel.",
    priority: "Medium",
    status: "Open",
    createdById: 2,
    assignedToId: 6,
    comments: [],
  },
];
