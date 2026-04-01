import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedTickets, seedUsers } from "./seed.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dataFile = path.join(dataDir, "app-data.enc");
const storageSecret = process.env.TICKETFLOW_SECRET;

if (!storageSecret) {
  throw new Error(
    "TICKETFLOW_SECRET environment variable is required for encrypted storage.",
  );
}

function deriveKey(secret) {
  return crypto.createHash("sha256").update(secret).digest();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { passwordHash: hash, passwordSalt: salt };
}

export function verifyPassword(password, user) {
  const hash = crypto
    .scryptSync(password, user.passwordSalt, 64)
    .toString("hex");
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(user.passwordHash, "hex"),
  );
}

export function sanitizeUser(user) {
  const { passwordHash, passwordSalt, ...safeUser } = user;
  return safeUser;
}

export function sanitizeUsers(users) {
  return users.map(sanitizeUser);
}

function encryptState(state) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(storageSecret), iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(state), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    payload: payload.toString("hex"),
  });
}

function decryptState(encryptedText) {
  const parsed = JSON.parse(encryptedText);
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    deriveKey(storageSecret),
    Buffer.from(parsed.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.payload, "hex")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8"));
}

function getSeedPassword(user) {
  if (user.passwordEnvVar) {
    return process.env[user.passwordEnvVar];
  }

  return undefined;
}

function createSeedState() {
  return {
    users: seedUsers.map((user) => {
      const password = getSeedPassword(user) ?? crypto.randomBytes(16).toString("base64url");

      if (!process.env[user.passwordEnvVar]) {
        console.warn(
          `No env var found for seed user ${user.email}; generated a temporary password.`,
        );
      }

      const { passwordEnvVar, ...rest } = user;
      return {
        ...rest,
        ...hashPassword(password),
      };
    }),
    tickets: seedTickets,
  };
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    const seededState = createSeedState();
    fs.writeFileSync(dataFile, encryptState(seededState), "utf8");
  }
}

export function loadState() {
  ensureDataFile();
  const encrypted = fs.readFileSync(dataFile, "utf8");
  return decryptState(encrypted);
}

export function saveState(state) {
  ensureDataFile();
  fs.writeFileSync(dataFile, encryptState(state), "utf8");
  return state;
}

export function createStoredUser({ id, name, email, password, team, active }) {
  return {
    id,
    name,
    email,
    team,
    active,
    ...hashPassword(password),
  };
}
