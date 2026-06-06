import { gvip } from "../api/gvip";

const TOKEN_KEY = "geoaudit_token";
const USER_KEY = "geoaudit_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getUserEmail() {
  return getUser()?.email || "";
}

function persistSession(tokenResponse) {
  localStorage.setItem(TOKEN_KEY, tokenResponse.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(tokenResponse.user));
}

export async function login(email, password) {
  const response = await gvip.auth.login({ email, password });
  persistSession(response);
  return response.user;
}

export async function register({ email, password, fullName }) {
  const response = await gvip.auth.register({
    email,
    password,
    full_name: fullName,
  });
  persistSession(response);
  return response.user;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
