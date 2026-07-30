// Auth token store for mobile.
//
// Unlike the web version (synchronous localStorage), native storage is async.
// We keep an in-memory mirror so the API client can read the token
// synchronously on each request; hydrate() loads it once at app start and
// setAuth/clearAuth keep both the mirror and SecureStore in sync.

import * as SecureStore from "expo-secure-store";
import type { Role } from "./types";

const TOKEN_KEY = "loommitra_token";
const ROLE_KEY = "loommitra_role";

let memToken: string | null = null;
let memRole: Role | null = null;

/** Load persisted auth into the in-memory mirror. Call once at startup. */
export async function hydrateAuth(): Promise<void> {
  try {
    memToken = await SecureStore.getItemAsync(TOKEN_KEY);
    memRole = (await SecureStore.getItemAsync(ROLE_KEY)) as Role | null;
  } catch {
    // Keychain unavailable — stay logged out rather than crash.
    memToken = null;
    memRole = null;
  }
}

export function getToken(): string | null {
  return memToken;
}

export function getRole(): Role | null {
  return memRole;
}

export async function setAuth(token: string, role: Role): Promise<void> {
  memToken = token;
  memRole = role;
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(ROLE_KEY, role);
}

export async function clearAuth(): Promise<void> {
  memToken = null;
  memRole = null;
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(ROLE_KEY);
}
